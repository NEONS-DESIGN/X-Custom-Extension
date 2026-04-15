// 拡張機能の動作設定
const EXT_CONFIG = {
    // ボタンを出現させないユーザーページ以外のパスのリスト
    ignorePaths: new Set([
        'home', 'explore', 'notifications', 'messages', 'i', 'compose',
        'search', 'settings', 'logout', 'login', 'signup', 'tos', 'privacy',
        'about', 'help', 'contact', 'status'
    ]),
    ui: {
        buttonId: 'ext-to-media-btn',
        textToMedia: 'メディア欄へ',
        textToPost: 'ポスト欄へ',
    },
    styles: {
        hiddenClass: 'ext-hidden'
    },
    waitTime: 500 // ページ遷移後のUI更新を待つ時間（ms）
};