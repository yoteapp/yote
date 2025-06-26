import { DateTime } from 'luxon';

/**
 * A map of the different types of date formats we use in the app.
 * @readonly
 * @enum {string}
 */
const DATE_FORMATS = {
  date: DateTime.DATE_SHORT
  , dateFull: DateTime.DATE_FULL
  , dateTime: DateTime.DATETIME_SHORT
  , dateTimeFull: DateTime.DATETIME_FULL
  , time: DateTime.TIME_SIMPLE
  , timeFull: DateTime.TIME_WITH_SHORT_OFFSET
}

/**
 * 
 * @param {string} date - date to be formatted 
 * @param {('date'|'dateFull'|'dateTime'|'dateTimeFull'|'time'|'timeFull')} dateFormat - format of the date
 * @returns {string} formatted date
 */
export const formatDate = (date, dateFormat = 'date') => {
  if(!date) return 'n/a';
  const format = DATE_FORMATS[dateFormat];
  return DateTime.fromISO(date).toLocaleString(format);
}
