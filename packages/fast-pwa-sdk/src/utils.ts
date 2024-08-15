import { PWA_EVENT_LOG_INFO_TYPES } from './types';

/**
 * 判断是否在PWA应用当中
 * @returns boolean
 */
export const isInPWA = (): boolean => {
    return !!(
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
    );
};

/**
 *
 * @param message 日志内容
 */
export const PwaLog = (
    logInfo: { message: string; type: PWA_EVENT_LOG_INFO_TYPES } = {
        message: '',
        type: PWA_EVENT_LOG_INFO_TYPES.INFO,
    }
): void => {
    console.log(
        `\n%c[${logInfo.type} FASK_PWA LOG] ${logInfo.message}`,
        'color:#fff; background:#f93802; border-radius: 4px;font-size: 10px; padding:2px '
    );
};

/**
 * 打开谷歌浏览器访问
 */
export const openChrome = () => {
    // eslint-disable-next-line no-useless-escape
    const path = window.location.href.replace(/^(http|https):\/\//, '').replace(/\#.*/, '');
    window.location.href = `intent://${path}#Intent;scheme=https;package=com.android.chrome;end`;
};
