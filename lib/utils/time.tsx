import { format } from 'date-fns'

export type TimeFormat = 'hh:mm:ss' | 'mm:ss' | 'ss' | 'h:mma' | string;
export type DateFormat = 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'MMM dd, yyyy' | 'MMM do, yyyy' | string;

//Houses common time and date utility functions
export default class TimeUtils {
    static getDateWithTime(date: Date, hours: number, minutes: number, seconds: number = 0, milliseconds: number = 0): Date {
        let newDate = new Date(date);
        newDate.setHours(hours, minutes, seconds, milliseconds);
        return newDate;
    }

    static getDateWithStringTime(date: Date, timeStr: string | undefined): Date {
        if (!timeStr) return date;
        let [hours, minutes] = timeStr.split(':').map(Number);
        return this.getDateWithTime(date, hours, minutes);
    }


    static getMidnight(date: Date, addDays: number = 0): Date {
        let newDate = this.getDateWithTime(date, 0, 0, 0, 0);
        if (addDays !== 0) newDate.setDate(newDate.getDate() + addDays);
        return newDate;
    }

    static getMidnightToday(): Date {
        return this.getMidnight(new Date());
    }

    static getDayOfTheWeek(date: Date, abbreviation: boolean): string {
        return format(date, abbreviation ? 'EEE' : 'EEEE');
    }

    static formatDate(date: Date, formatStr: DateFormat = 'MM/dd/yyyy'): string {
        return format(date, formatStr);
    }

    static formatTime(date: Date, formatStr: TimeFormat = 'hh:mm:ss'): string {
        return format(date, formatStr);
    }

    static formatTimeFromString(timeStr: string | undefined, formatStr: TimeFormat = 'h:mma'): string {
        let midnight = this.getMidnightToday();
        let dateWithTime = this.getDateWithStringTime(midnight, timeStr);
        return this.getShortTimeString(dateWithTime);
    }

    static formatDateTime(date: Date, dateFormat: DateFormat = 'MM/do/yyyy', timeFormat: TimeFormat = 'hh:mm:ss'): string {
        return `${this.formatDate(date, dateFormat)} ${this.formatTime(date, timeFormat)}`;
    }

    static getShortDateString(date: Date, abbreviateDay: boolean = true, abbreviateMonth: boolean = true): string {
        let dayOfTheWeek = this.getDayOfTheWeek(date, abbreviateDay);
        let dateStr = this.formatDate(date, abbreviateMonth ? 'MMM do, yyyy' : 'MMMM do, yyyy');
        return `${dayOfTheWeek}, ${dateStr}`;
    }

    static getShortTimeString(date: Date): string {
        return this.formatTime(date, 'h:mma').toLocaleLowerCase();
    }

    static getShortDateTimeString(date: Date, textBetweenDateAndTime: string = " ", abbreviateDay: boolean = true, abbreviateMonth: boolean = true): string {
        let sds = this.getShortDateString(date, abbreviateDay, abbreviateMonth);
        let sts = this.getShortTimeString(date);
        return `${sds}${textBetweenDateAndTime}${sts}`;
    }
}
