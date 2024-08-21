import dayjs from 'dayjs';
import ptBR from 'dayjs/locale/pt-br';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.locale(ptBR);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');

export function formatDate(date: Date) {
    const dayjsDate = dayjs.tz(date);

    return dayjsDate.format('DD MMM, YYYY');
}

export function formatTime(date: Date) {
    const dayjsDate = dayjs.tz(date);

    return dayjsDate.format('HH:mm[h]');
}

export function formatDateTime(date: Date) {
    const dayjsDate = dayjs.tz(date);

    return dayjsDate.format('DD MMM, YYYY HH:mm[h]');
}

/* 
.toLocaleString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                            }) + 'h'
as dayjs
*/

export function formatFullDate(date: Date) {
    const dayjsDate = dayjs.tz(date);

    return dayjsDate.format('dddd, DD/MM/YYYY HH:mm[h]');
}

export function formatExpirationDate(date: Date) {
    const dayjsDate = dayjs.tz(date);

    return dayjsDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
}
