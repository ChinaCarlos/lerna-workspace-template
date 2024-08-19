import Bowser from 'bowser';
import { PWA_CONFIG_OPTIONS, PWA_EVENT_LOG_INFO_TYPES, PWA_INSTALL_STATUS, USER_OUTCOME_TYPES } from './types';
import { PwaLog } from './utils';
import './index.scss';
/**
 * FAST_PWA_SDK
 * 快速构建PWA的SDK,通过各种配置快速生成PWA应用
 */
const FAST_PWA_SDK_INIT_CONFIG_LOADING = 'FAST_PWA_SDK_INIT_CONFIG_LOADING';
const FAST_PWA_LINK_HEADER = 'FAST_PWA_LINK_HEADER';
const FAST_PWA_INSTALL_MODAL = 'FAST_PWA_INSTALL_MODAL';
const PREFIX_LOCAL_CACHE_KEY = 'FAST_PWA_SDK_INSTALL';
const DEFAULT_INSTALL_TIME = 10 * 1000;
const DEFAULT_INTERVAL = 100;
const DEFAULT_TOTAL_PROGRESS = 100;

class FAST_PWA_SDK {
    public options: PWA_CONFIG_OPTIONS | null = null;
    public installEvent: any = null;
    public instalStatus: PWA_INSTALL_STATUS = PWA_INSTALL_STATUS.TO_BE_INSTALLED;
    public installProgress: number = 0;
    public serviceWorkerInstallError: boolean = false;

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
     * 初始化PWA SDK Loading 界面所需要的DOM
     */
    private _initPwaSDKDom() {
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
     * PWA  install 动画
     */

    private _pwaInstallModalDom() {
        const installModalDom = document.createElement('div');
        installModalDom.id = FAST_PWA_INSTALL_MODAL;
        installModalDom.style.display = 'none';

        installModalDom.innerHTML = `
          <div class='box' style="animation: installing   ${DEFAULT_INSTALL_TIME / 1000}s forwards linear;">
           <div class='install' id='install_text'>PWA APP INSTALL...</div>
          </div>
        `;

        document.body.appendChild(installModalDom);
    }

    /**
     * 打开PWA install 安装动画
     */
    private _openPwaInstallModal() {
        const pwaInstallDom = document.querySelector(`#${FAST_PWA_INSTALL_MODAL}`) as HTMLDivElement;
        pwaInstallDom.style.display = 'block';
    }

    /**
     * PWA install 安装成功
     */
    private _pwaInstallSuccessHandle() {
        const pwaInstallDom = document.querySelector(`#${FAST_PWA_INSTALL_MODAL} #install_text`) as HTMLDivElement;
        if (pwaInstallDom) {
            pwaInstallDom.innerText = 'PWA APP INSTALLED';
        }
    }

    /**
     * 关闭PWA install 安装动画
     */
    private _closePwaInstallModal() {
        const pwaInstallDom = document.querySelector(`#${FAST_PWA_INSTALL_MODAL}`) as HTMLDivElement;
        pwaInstallDom.style.display = 'none';
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
        !!this.options.enableInitPwaLoading && this._initPwaSDKDom();
        this._showInitPwaLoading();
        this._createPwaHeaderTag();
        this._beforeInstallPromptHandle();
        await this._registerServiceWorker();
        !!this.options.enableInitPwaLoading &&
            setTimeout(() => {
                this._hideInitPwaLoading();
            }, 800);
        !this.options.closePwaInstallProgress && this._pwaInstallModalDom();
    }

    /**
     * PWA 安装失败处理
     */
    private _installPwaFailedHandle() {
        this.serviceWorkerInstallError = true;
        this.options?.onInstallFailed && this.options.onInstallFailed();
        this.instalStatus = PWA_INSTALL_STATUS.INSTALL_FAILED;
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
                this._installPwaFailedHandle();
                console.error(`register fail：${error}`);
            }
        } else {
            this._installPwaFailedHandle();
            console.log(`this browser don't support serviceWorker`);
        }
    }

    /**
     * 监听浏览器尝试安装事件beforeinstallprompt处理
     */
    private _beforeInstallPromptHandle() {
        window.addEventListener('beforeinstallprompt', event => {
            this.installEvent = event;
            this.instalStatus = PWA_INSTALL_STATUS.TO_BE_INSTALLED;
            localStorage.setItem(`${PREFIX_LOCAL_CACHE_KEY}_${this.options.PWAId}`, '0');
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
     * PWA 安装进度
     * 根据不同的安装平台需要不同的处理
     * android, ios, desktop
     */
    private _installPwaProgress() {
        !this.options.closePwaInstallProgress && this._openPwaInstallModal();
        return new Promise(resolve => {
            const timerId = setInterval(() => {
                this.installProgress =
                    this.installProgress + (DEFAULT_INTERVAL * DEFAULT_TOTAL_PROGRESS) / DEFAULT_INSTALL_TIME;
                this.options?.onInstallProgress && this.options.onInstallProgress(this.installProgress);
                if (this.installProgress >= 100) {
                    clearInterval(timerId);
                    this.installProgress = 100;
                    if (!this.options.closePwaInstallProgress) {
                        this._pwaInstallSuccessHandle();
                        setTimeout(() => {
                            this._closePwaInstallModal();
                        }, 2000);
                    }
                    resolve(true);
                }
            }, DEFAULT_INTERVAL);
        });
    }

    /**
     * 检查是否不支持PWA
     */
    checkDontSupPwa() {
        return (
            !('serviceWorker' in navigator) ||
            this.serviceWorkerInstallError ||
            /lark|qq|wathaspp|xiaomi|redmi|miuibrowser|samsungbrowser|vivobrowser|oppobrowser|htcbrowser|oneplusbrowser|twitter|heytapbrowser|facebook|fb_iab|fb4a|fban|fbav/.test(
                navigator.userAgent.toLocaleLowerCase()
            ) ||
            Bowser.getParser(window.navigator.userAgent).getBrowserName().toLocaleLowerCase() !== 'chrome'
        );
    }

    /**
     * 检查是否已经安装过该PWA
     */
    checkIsInstallPWA() {
        return (
            !!Number(localStorage.getItem(`${PREFIX_LOCAL_CACHE_KEY}_${this.options.PWAId}`)) ||
            this.instalStatus === PWA_INSTALL_STATUS.INSTALLED
        );
    }

    /**
     * 安装PWA
     */
    async installPWA() {
        // 首先判断是否已经安装过该PWA，如果安装过直接打开startUrl
        // 如果没有安装该PWA尝试安装该PWA，如果可以安装，走安装流程
        // 如果该浏览器不支持PWA，则打开startUrl
        const isInstallPwa = this.checkIsInstallPWA();
        if (this.installEvent && !isInstallPwa && !this.checkDontSupPwa()) {
            this.options?.onInstall && this.options.onInstall();
            const result = await this.installEvent?.prompt?.();
            if (result?.outcome === USER_OUTCOME_TYPES.ACCEPTED) {
                console.log('user accept install PWA App！');
                this.instalStatus = PWA_INSTALL_STATUS.INSTALLING;
                await this._installPwaProgress();
                this.instalStatus = PWA_INSTALL_STATUS.INSTALLED;
                localStorage.setItem(`${PREFIX_LOCAL_CACHE_KEY}_${this.options.PWAId}`, '1');
                this.options?.onInstalled && this.options.onInstalled();
            } else {
                console.log('user reject install PWA App！');
            }
        } else {
            this.goToApp();
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
