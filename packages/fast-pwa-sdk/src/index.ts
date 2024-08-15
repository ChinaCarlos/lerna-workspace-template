import { PWA_CONFIG_OPTIONS, PWA_EVENT_LOG_INFO_TYPES, USER_OUTCOME_TYPES } from './types';
import { PwaLog } from './utils';
import './index.scss';
/**
 * FAST_PWA_SDK
 * 快速构建PWA的SDK,通过各种配置快速生成PWA应用
 */

const FAST_PWA_SDK_INIT_CONFIG_LOADING = 'FAST_PWA_SDK_INIT_CONFIG_LOADING';
const FAST_PWA_LINK_HEADER = 'FAST_PWA_LINK_HEADER';

class FAST_PWA_SDK {
    public options: PWA_CONFIG_OPTIONS | null = null;
    public installEvent: any = null;

    public registration: ServiceWorkerRegistration | null = null;
    private static instance?: FAST_PWA_SDK;

    constructor(options: PWA_CONFIG_OPTIONS) {
        // 禁止多次实例化
        if (FAST_PWA_SDK.instance) {
            PwaLog({
                type: PWA_EVENT_LOG_INFO_TYPES.ERROR,
                message: 'FAST_PWA_SDK 实例已存在，不允许多次实例化!',
            });
            return;
        }

        this.options = options;

        // 检查初始化参数
        const isPassedCheckedOption = this._checkInitOptions();
        if (!isPassedCheckedOption) return;

        this._initSDK();

        FAST_PWA_SDK.instance = this;
    }

    /**
     * 创建PWA SDK 所需要的DOM
     */
    private initPWASDKDOM() {
        const initLoadingDom = document.createElement('div');
        initLoadingDom.id = FAST_PWA_SDK_INIT_CONFIG_LOADING;
        initLoadingDom.style.display = 'none';
        initLoadingDom.innerHTML = `
        <div class="box">
        <div class="circular-box">
        <svg class="circular" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none"></circle></svg>
        </div>
        <div class="text">loading</div>
        </div>`;
        document.body.appendChild(initLoadingDom);
    }

    /**
     * 展示初始化PWA 配置的loading
     */
    private _showInitPwaLoading() {
        const initPwaLoadingDom = document.querySelector(`#${FAST_PWA_SDK_INIT_CONFIG_LOADING}`) as HTMLDivElement;
        initPwaLoadingDom.style.display = 'block';
    }

    /**
     * 展示初始化PWA 配置的loading
     */
    private _hideInitPwaLoading() {
        const initPwaLoadingDom = document.querySelector(`#${FAST_PWA_SDK_INIT_CONFIG_LOADING}`) as HTMLDivElement;
        initPwaLoadingDom.style.display = 'none';
    }

    /**
     * 检查初始化SDK参数
     */
    private _checkInitOptions() {
        if (!this.options) {
            PwaLog({
                type: PWA_EVENT_LOG_INFO_TYPES.ERROR,
                message: 'FAST_PWA_SDK 初始化失败，未发现初始化参数！',
            });
            return false;
        } else {
            const { manifestUrl = '' } = this.options;
            if (!manifestUrl) {
                PwaLog({
                    type: PWA_EVENT_LOG_INFO_TYPES.ERROR,
                    message: 'FAST_PWA_SDK 初始化失败，未发现manifestUrl 参数！',
                });
                return false;
            }
            return true;
        }
    }

    /**
     * 初始化SDK
     *
     */
    private async _initSDK() {
        !!this.options.enableInitPwaLoading && this.initPWASDKDOM();
        this._showInitPwaLoading();
        this._createPwaHeaderTag();
        this._beforeInstallPromptHandle();
        await this._registerServiceWorker();

        !!this.options.enableInitPwaLoading &&
            setTimeout(() => {
                this._hideInitPwaLoading();
            }, 2000);
    }

    /**
     * 注册service worker
     */
    private async _registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });
                if (registration.installing) {
                    console.log('正在安装 Service worker');
                } else if (registration.waiting) {
                    console.log('已安装 Service worker installed');
                } else if (registration.active) {
                    console.log('激活 Service worker');
                }
                this.registration = registration;
            } catch (error) {
                console.error(`注册失败：${error}`);
            }
        } else {
            console.log(`this browser don't support serviceWorker`);
        }
    }

    /**
     * 监听浏览器尝试安装事件beforeinstallprompt处理
     */
    private _beforeInstallPromptHandle() {
        window.addEventListener('beforeinstallprompt', event => {
            this.installEvent = event;
            event.preventDefault();
        });
    }

    /**
     * 创建SDK header 标签 加载manifest.json文件
     */
    private _createPwaHeaderTag() {
        let link = document.querySelector(`link#${FAST_PWA_LINK_HEADER}`) as HTMLLinkElement;
        if (link) return;

        link = document.createElement('link');
        link.href = this.options.manifestUrl;
        link.rel = 'manifest';
        link.id = FAST_PWA_LINK_HEADER;
        document.head.appendChild(link);
    }

    /**
     * 安装PWA
     */
    async installPWA() {
        if (this.installEvent) {
            const result = await this.installEvent?.prompt?.();
            console.log('result:', result);
            if (result?.outcome === USER_OUTCOME_TYPES.ACCEPTED) {
                console.log('用户同意安装PWA！');
            } else {
                console.log('用户拒绝安装PWA！');
            }
        }
    }

    /**
     * 打开链接
     */
    goToApp(url: string = '') {
        window.open(url || this.options.startUrl, '_blank');
    }
}

export default FAST_PWA_SDK;
