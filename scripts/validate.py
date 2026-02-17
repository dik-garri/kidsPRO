#!/usr/bin/env python3
"""
Validation script for Sovyonok PRO project.

Checks:
1. Every task in every JSON file has a matching WAV speech file
2. curriculum.json references match actual task files on disk
3. Every topic in curriculum.json with a taskFile has the actual file
4. Task counts match: curriculum.json taskCount vs actual tasks in JSON
5. Orphan WAV files (WAV files that don't correspond to any task)
"""

import json
import os
import sys
from pathlib import Path
from collections import defaultdict

# Project root is one level up from scripts/
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
TASKS_DIR = DATA_DIR / "tasks"
SPEECH_DIR = PROJECT_ROOT / "assets" / "speech"
CURRICULUM_FILE = DATA_DIR / "curriculum.json"


def load_json(path):
    """Load and return parsed JSON from file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def collect_all_tasks():
    """
    Walk all JSON task files and collect task IDs with their questions.
    Returns:
        tasks_by_file: dict of taskFile path -> list of {id, question}
        all_task_ids: set of (taskFile_without_ext, task_id) tuples
    """
    tasks_by_file = {}
    all_task_ids = set()

    for json_path in sorted(TASKS_DIR.rglob("*.json")):
        rel = json_path.relative_to(TASKS_DIR)
        task_file_key = str(rel)  # e.g. "age3/speech/s01.json"
        task_file_stem = str(rel).replace(".json", "")  # e.g. "age3/speech/s01"

        data = load_json(json_path)
        tasks = data.get("tasks", [])
        tasks_by_file[task_file_key] = tasks

        for task in tasks:
            all_task_ids.add((task_file_stem, task["id"]))

    return tasks_by_file, all_task_ids


def collect_all_wavs():
    """
    Walk all WAV files in assets/speech/ and collect them.
    Returns:
        wav_set: set of (topic_path, wav_stem) tuples
            where topic_path is like "age3/speech/s01"
            and wav_stem is like "s01_01"
    """
    wav_set = set()

    if not SPEECH_DIR.exists():
        return wav_set

    for wav_path in sorted(SPEECH_DIR.rglob("*.wav")):
        rel = wav_path.relative_to(SPEECH_DIR)
        parts = rel.parts  # e.g. ("age3", "speech", "s01", "s01_01.wav")
        if len(parts) == 4:
            topic_path = f"{parts[0]}/{parts[1]}/{parts[2]}"
            wav_stem = wav_path.stem
            wav_set.add((topic_path, wav_stem))
        else:
            # Unexpected structure
            print(f"  WARNING: Unexpected WAV path structure: {rel}")

    return wav_set


def validate_curriculum(tasks_by_file):
    """
    Validate curriculum.json against actual task files.
    Returns lists of issues and info about expected counts.
    """
    curriculum = load_json(CURRICULUM_FILE)
    issues = []
    curriculum_topics = []  # (taskFile, expected_count, age_id, subject_id, topic_id)

    for age_group in curriculum.get("ageGroups", []):
        age_id = age_group["id"]
        for subject in age_group.get("subjects", []):
            subject_id = subject["id"]
            for topic in subject.get("topics", []):
                topic_id = topic["id"]
                task_file = topic.get("taskFile")
                task_count = topic.get("taskCount", 0)

                if not task_file:
                    issues.append(
                        f"CURRICULUM: Topic {age_id}/{subject_id}/{topic_id} "
                        f"has no taskFile"
                    )
                    continue

                curriculum_topics.append(
                    (task_file, task_count, age_id, subject_id, topic_id)
                )

                # Check file exists
                full_path = TASKS_DIR / task_file
                if not full_path.exists():
                    issues.append(
                        f"CURRICULUM: taskFile '{task_file}' does not exist on disk"
                    )
                    continue

                # Check task count matches
                actual_tasks = tasks_by_file.get(task_file, [])
                actual_count = len(actual_tasks)
                if actual_count != task_count:
                    issues.append(
                        f"CURRICULUM: {task_file} taskCount={task_count} "
                        f"but actual={actual_count}"
                    )

    # Check for task files on disk not referenced in curriculum
    curriculum_files = {t[0] for t in curriculum_topics}
    for task_file_key in tasks_by_file:
        if task_file_key not in curriculum_files:
            issues.append(
                f"ORPHAN TASK FILE: {task_file_key} exists on disk "
                f"but not referenced in curriculum.json"
            )

    return issues, curriculum_topics


def find_missing_wavs(all_task_ids, wav_set):
    """Find tasks that don't have corresponding WAV files."""
    missing = []
    for topic_path, task_id in sorted(all_task_ids):
        if (topic_path, task_id) not in wav_set:
            missing.append((topic_path, task_id))
    return missing


def find_orphan_wavs(all_task_ids, wav_set):
    """Find WAV files that don't correspond to any task."""
    orphans = []
    for topic_path, wav_stem in sorted(wav_set):
        if (topic_path, wav_stem) not in all_task_ids:
            orphans.append((topic_path, wav_stem))
    return orphans


def get_task_question(tasks_by_file, topic_path, task_id):
    """Look up the question text for a given task."""
    task_file_key = topic_path + ".json"
    tasks = tasks_by_file.get(task_file_key, [])
    for task in tasks:
        if task["id"] == task_id:
            return task.get("question", "")
    return ""


def main():
    print("=" * 70)
    print("SOVYONOK PRO - Project Validation")
    print("=" * 70)
    print(f"Project root: {PROJECT_ROOT}")
    print()

    # Collect data
    print("Scanning task files...")
    tasks_by_file, all_task_ids = collect_all_tasks()
    print("Scanning WAV files...")
    wav_set = collect_all_wavs()

    # Summary counts
    total_topics = len(tasks_by_file)
    total_tasks = len(all_task_ids)
    total_wavs = len(wav_set)

    print()
    print("-" * 70)
    print("SUMMARY COUNTS")
    print("-" * 70)
    print(f"  Total topic files (JSON):  {total_topics}")
    print(f"  Total tasks:               {total_tasks}")
    print(f"  Total WAV files:           {total_wavs}")
    print()

    all_issues = []

    # 1. Curriculum validation
    print("-" * 70)
    print("CHECK 1: Curriculum.json validation")
    print("-" * 70)
    curriculum_issues, curriculum_topics = validate_curriculum(tasks_by_file)
    if curriculum_issues:
        for issue in curriculum_issues:
            print(f"  ISSUE: {issue}")
        all_issues.extend(curriculum_issues)
    else:
        print("  OK: All curriculum references match")
    print()

    # 2. Missing WAV files
    print("-" * 70)
    print("CHECK 2: Missing WAV files (task exists, no WAV)")
    print("-" * 70)
    missing_wavs = find_missing_wavs(all_task_ids, wav_set)
    if missing_wavs:
        for topic_path, task_id in missing_wavs:
            question = get_task_question(tasks_by_file, topic_path, task_id)
            wav_path = f"assets/speech/{topic_path}/{task_id}.wav"
            print(f"  MISSING: {wav_path}")
            print(f"           question: \"{question}\"")
        all_issues.extend(
            [f"MISSING WAV: {tp}/{tid}.wav" for tp, tid in missing_wavs]
        )
    else:
        print("  OK: All tasks have matching WAV files")
    print()

    # 3. Orphan WAV files
    print("-" * 70)
    print("CHECK 3: Orphan WAV files (WAV exists, no matching task)")
    print("-" * 70)
    orphan_wavs = find_orphan_wavs(all_task_ids, wav_set)
    if orphan_wavs:
        for topic_path, wav_stem in orphan_wavs:
            wav_path = f"assets/speech/{topic_path}/{wav_stem}.wav"
            print(f"  ORPHAN: {wav_path}")
        all_issues.extend(
            [f"ORPHAN WAV: {tp}/{ws}.wav" for tp, ws in orphan_wavs]
        )
    else:
        print("  OK: No orphan WAV files found")
    print()

    # Final result
    print("=" * 70)
    if all_issues:
        print(f"RESULT: FAIL - {len(all_issues)} issue(s) found")
        print(f"  - Curriculum mismatches: {len(curriculum_issues)}")
        print(f"  - Missing WAV files:     {len(missing_wavs)}")
        print(f"  - Orphan WAV files:      {len(orphan_wavs)}")
    else:
        print("RESULT: PASS - All checks passed!")
    print("=" * 70)

    return len(all_issues)


if __name__ == "__main__":
    issue_count = main()
    sys.exit(1 if issue_count > 0 else 0)
