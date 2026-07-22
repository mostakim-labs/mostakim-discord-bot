// import en from "../../../resources/Locales/en.mjs"
// import de from "../../../resources/Locales/de.mjs"

import GlobalConfig from '../../../mostakim.mjs'


const Locales = {};

for (const lang of GlobalConfig.Languages) {
    const Local = await import(`../../../resources/Locales/${lang}.mjs`)
    Locales[lang] = Local.default;
}

Object.freeze(Locales);



import "./Guild.mjs"
import "./User.mjs"
import "./Channel.mjs"
import "./replaceEmoji.mjs"
import "./Message.mjs"


String.prototype.translate = function (lang) {
    lang = Locales[lang];

    return this.replaceAll(/\^\{(.*?)\}/g, (match, key) => {

        const splited = key.split(".");
        let value = lang;

        for (const key of splited) {
            value = value?.[key];
        }



        if (typeof value === "string")
            return value;
        else
            return match;

    })

}