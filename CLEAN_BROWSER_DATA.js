// Script para limpar dados antigos do Supabase
// Execute no console do navegador (F12 > Console) e cole este código:

(function cleanOldSupabaseData() {
    console.log('🧹 Limpando dados antigos do Supabase...');

    // 1. Limpar todos os itens do localStorage relacionados ao Supabase
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => {
        console.log('🗑️ Removendo localStorage:', key);
        localStorage.removeItem(key);
    });

    // 2. Limpar sessionStorage também
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
            sessionKeysToRemove.push(key);
        }
    }

    sessionKeysToRemove.forEach(key => {
        console.log('🗑️ Removendo sessionStorage:', key);
        sessionStorage.removeItem(key);
    });

    // 3. Limpar todos os cookies do Supabase
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name.includes('sb-') || name.includes('supabase')) {
            console.log('🍪 Removendo cookie:', name);
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
    });

    console.log('✅ Limpeza concluída!');
    console.log('📝 Total removido:');
    console.log('  - LocalStorage:', keysToRemove.length, 'itens');
    console.log('  - SessionStorage:', sessionKeysToRemove.length, 'itens');
    console.log('  - Cookies: verificados e removidos');
    console.log('');
    console.log('🔄 AGORA: Recarregue a página (F5) e faça login novamente!');

    return {
        localStorageRemoved: keysToRemove,
        sessionStorageRemoved: sessionKeysToRemove,
        message: 'Limpeza concluída! Recarregue a página e faça login.'
    };
})();
