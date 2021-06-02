import { Duration } from 'luxon';


/**
     * We receive the uptime of nodes in seconds.
     * This methods converts it into the format:
     *          X days Y hours Z minutes
     */
export function humanizeUptime(seconds: number): string {
    var duration: Duration = Duration.fromMillis(seconds * 1000).shiftTo('days', 'hours', 'minutes');
    var ret: string = '';
    if (duration.days > 0) {
        ret = ret.concat(duration.days + " d ");
    }
    if (duration.hours > 0) {
        ret = ret.concat(duration.hours + " h ");
    }
    if (duration.minutes > 0) {
        ret = ret.concat(duration.minutes.toFixed(0) + " m ");
    }
    return ret;
}