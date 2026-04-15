/**
* 現在のページからユーザー情報と表示状態を取得する
* @returns {Object|null} ユーザー名とサブページフラグ。対象外ページはnull
*/
function getPageInfo() {
    try {
        let pathParts = window.location.pathname.split('/').filter(p => p);
        // ルートや不正なパスは対象外
        if (pathParts.length === 0) return null;
        // 特定のパス（ポスト詳細など）ではボタンを非表示にする
        if (pathParts.length >= 2) {
            if (EXT_CONFIG.ignorePaths.has(pathParts[1].toLowerCase())) return null;
        } else if (pathParts.length === 1) {
            if (EXT_CONFIG.ignorePaths.has(pathParts[0].toLowerCase())) return null;
        }
        let isSubPage = pathParts.length > 1;
        let username = pathParts[0];
        return { username, isSubPage };
    } catch (error) {
        console.error('ページ情報の取得に失敗:', error);
        return null;
    }
}

// 画面右下に固定表示するメディアリンクボタンを生成・更新する
class MediaButtonManager {
    constructor() {
        this.button = null;
        this.initButton();
    }
    // ボタン要素をDOMに挿入する
    initButton() {
        this.button = document.createElement('a');
        this.button.id = EXT_CONFIG.ui.buttonId;
        this.button.textContent = EXT_CONFIG.ui.buttonText;
        this.button.classList.add(EXT_CONFIG.styles.hiddenClass);
        document.body.appendChild(this.button);
        // SPA遷移
        this.button.addEventListener('click', (e) => {
            e.preventDefault(); // ブラウザ標準のフルリロード遷移をキャンセル
            const targetUrl = this.button.getAttribute('href');
            if (targetUrl) {
                // URLだけを非同期で書き換える
                window.history.pushState(null, '', targetUrl);
                // 疑似的にpopstateイベントを発火させ、XのReactルーターに画面の書き換えを促す
                window.dispatchEvent(new Event('popstate'));
                // 画面遷移後にスクロール位置をリセット
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, EXT_CONFIG.waitTime);
            }
        });
    }
    // 現在のURLに応じてボタンの表示状態・リンク先・テキストを更新する
    update() {
        const pageInfo = getPageInfo();
        if (pageInfo) {
            if (pageInfo.isSubPage) {
                this.button.href = `/${pageInfo.username}`;
                this.button.textContent = EXT_CONFIG.ui.textToPost;
            } else {
                this.button.href = `/${pageInfo.username}/media`;
                this.button.textContent = EXT_CONFIG.ui.textToMedia;
            }
            this.button.classList.remove(EXT_CONFIG.styles.hiddenClass);
        } else {
            this.button.classList.add(EXT_CONFIG.styles.hiddenClass);
        }
    }
}

// SPAの画面遷移を監視するクラス
class NavigationObserver {
    /**
     * @param {Function} onNavigate 画面遷移時に実行されるコールバック関数
     */
    constructor(onNavigate) {
        this.onNavigate = onNavigate;
        this.lastUrl = location.href;
        this.isNavigating = false;
    }
    // body要素配下のDOMツリー全体の変更を監視対象
    // コールバック内はURLの文字列比較のみ
    start() {
        this.observer = new MutationObserver(() => this.checkUrl());
        this.observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('popstate', () => this.checkUrl());
    }
    // URLの変更判定および画面更新処理
    checkUrl() {
        if (this.lastUrl !== location.href) {
            this.lastUrl = location.href;

            if (!this.isNavigating) {
                this.isNavigating = true;
                requestAnimationFrame(() => {
                    this.onNavigate();
                    this.isNavigating = false;
                });
            }
        }
    }
}

// エントリーポイント
function main() {
    const buttonManager = new MediaButtonManager();
    const navObserver = new NavigationObserver(() => {
        buttonManager.update();
    });
    buttonManager.update();
    navObserver.start();
}

// ページ読み込み後に実行
main();