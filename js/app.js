import { router } from './router.js';
import { homeScreen } from './screens/home.js';
import { subjectsScreen } from './screens/subjects.js';
import { topicsScreen } from './screens/topics.js';
import { playScreen } from './screens/play.js';
import { state } from './state.js';
import './sounds.js';

state.load();

router.add('/', homeScreen);
router.add('/subjects/:ageGroup', subjectsScreen);
router.add('/topics/:ageGroup/:subject', topicsScreen);
router.add('/play/:ageGroup/:subject/:topic', playScreen);

document.addEventListener('DOMContentLoaded', () => {
  router.init();
});
