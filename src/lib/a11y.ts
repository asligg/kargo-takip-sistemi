export const A11Y_KEY = "kt_a11y";

/**
 * Sayfa ilk çizilmeden önce çalışan satır içi betik: tercih kayıtlıysa <html>'e "a11y" sınıfını ekler
 * (aksi halde sayfa önce normal görünüp sonra büyür).
 */
export const A11Y_INIT_SCRIPT = `try{if(localStorage.getItem("${A11Y_KEY}")==="1")document.documentElement.classList.add("a11y")}catch(e){}`;
