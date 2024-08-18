export interface PWA_CONFIG_OPTIONS {
    /**
     * manifest.json 文件地址
     * 确保可以跨域正常能访问
     * 确保格式正确，参见：
     * https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/manifest.json
     */
    manifestUrl: string;
    /**
     * 安装PWA之后，需要打开的地址，正常场景下是manifest.json 的start_url字段，也可自定义
     */
    startUrl?: string;
    /**
     * PWA 应用的ID，确保唯一
     */
    PWAId: string;
    /**
     * 是否展示初始化SDK的loading,默认是false
     */
    enableInitPwaLoading?: boolean;
    /**
     * 是否关闭展示PWA安装进度动画,默认是false，推荐用户自定义安装动画
     */
    closePwaInstallProgress?: boolean;

    /**
     * 安装事件
     */
    onInstall?: () => void;

    /**
     * 安装进度事件
     */
    onInstallProgress?: (progress: number) => void;

    /**
     * 安装完成事件
     */
    onInstalled?: () => void;

    /**
     * 安装失败事件
     */
    onInstallFailed?: () => void;
}

export enum PWA_LOG_TYPES {
    PWA_PROMOTE = 'PWA_PROMOTE',
}

export enum PWA_EVENT_LOG_INFO_TYPES {
    SUCCESS = '🚀',
    WARNING = '🚧',
    INFO = '📝',
    ERROR = '🚑',
}

export enum USER_OUTCOME_TYPES {
    DISMISSED = 'dismissed',
    ACCEPTED = 'accepted',
}

/**
 * PWA 安装状态
 */

export enum PWA_INSTALL_STATUS {
    TO_BE_INSTALLED = 'TO_BE_INSTALLED',
    INSTALLING = 'INSTALLING',
    INSTALLED = 'INSTALLED',
    INSTALL_FAILED = 'INSTALL_FAILED',
}
