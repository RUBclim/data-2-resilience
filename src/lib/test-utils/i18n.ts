import { i18n } from '#i18n/i18n-util.js';
import { loadAllLocales } from '#i18n/i18n-util.sync.js';

loadAllLocales();

/** translation functions for unit tests */
export const LL = i18n().en;
export const LLde = i18n().de;
