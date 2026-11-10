// Сопствене иконице у стилу OpenMoji (72×72, обојене површине, црна контура 2).
const S = (body) => `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><g stroke="#000" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
module.exports = {
  W_WALL: S(`<path d="M4 50 L22 40 L40 46 L58 34 L68 38 L68 52 L58 48 L40 60 L22 54 L4 62Z" fill="#C9A26B"/>
    <path d="M4 50 V44 h4 v3 h4 v-5 h4 v3 h4 v-6 l2 -1 v12" fill="#C9A26B"/>
    <path d="M40 46 V40 h4 v3 h4 v-6 h4 v3 h4 v-6 h2 v10" fill="#C9A26B"/>
    <rect x="20" y="30" width="8" height="14" fill="#B08850"/><path d="M19 30 h10 v-4 h-10z" fill="#8a6a3c"/>
    <rect x="54" y="24" width="8" height="14" fill="#B08850"/><path d="M53 24 h10 v-4 h-10z" fill="#8a6a3c"/>
    <path d="M4 66 L22 60 L40 66 L58 56 L68 58" fill="none" stroke="#5c9a3a" stroke-width="3"/>`),
  W_STEP: S(`<path d="M8 62 h56 v-8 h-6 v-8 h-6 v-8 h-6 v-8 h-4 v-8 h-12 v8 h-4 v8 h-6 v8 h-6 v8 h-6z" fill="#D7B377"/>
    <path d="M32 62 V22 h8 V62" fill="#BFA06A"/><rect x="31" y="12" width="10" height="10" fill="#A8885A"/>`),
  W_CHRIST: S(`<path d="M10 64 Q36 50 62 64Z" fill="#7DB35A"/>
    <rect x="32" y="40" width="8" height="18" fill="#CFCFCF"/>
    <path d="M10 26 h52 v5 h-16 v12 l-2 14 h-16 l-2 -14 v-12 h-16z" fill="#E8E8E8"/>
    <circle cx="36" cy="19" r="5" fill="#E8E8E8"/>`),
  W_BIGBEN: S(`<path d="M28 66 V22 h16 v44z" fill="#D9B46A"/><path d="M26 22 h20 l-10 -14z" fill="#3E5A47"/>
    <rect x="27" y="26" width="18" height="18" fill="#C9A35A"/><circle cx="36" cy="35" r="7" fill="#fff"/>
    <path d="M36 35 v-5 M36 35 h4" fill="none"/><path d="M31 50 v12 M36 50 v12 M41 50 v12" fill="none"/>`),
  W_PISA: S(`<g transform="rotate(8 36 64)"><rect x="26" y="16" width="20" height="48" fill="#F2EDE0"/>
    <path d="M26 24 h20 M26 32 h20 M26 40 h20 M26 48 h20 M26 56 h20" fill="none"/>
    <rect x="29" y="8" width="14" height="8" fill="#E6DFCC"/></g><path d="M14 66 h44" fill="none"/>`),
  W_STONES: S(`<path d="M6 62 h60" fill="none" stroke="#5c9a3a" stroke-width="3"/>
    <rect x="8" y="34" width="10" height="28" fill="#9AA0A6"/><rect x="24" y="34" width="10" height="28" fill="#9AA0A6"/>
    <rect x="6" y="28" width="30" height="7" fill="#868C92"/>
    <rect x="42" y="38" width="9" height="24" fill="#9AA0A6"/><rect x="55" y="40" width="9" height="22" fill="#9AA0A6"/>
    <rect x="40" y="32" width="26" height="7" fill="#868C92"/>`),
  W_FALLS: S(`<path d="M6 20 h22 v8 h-22z M44 20 h22 v8 h-22z" fill="#6E8B5A"/>
    <path d="M28 20 h16 v36 h-16z" fill="#7FC4EE"/><path d="M32 24 v28 M36 22 v32 M40 24 v28" fill="none" stroke="#fff"/>
    <path d="M14 56 Q36 50 58 56 Q50 66 36 66 Q22 66 14 56Z" fill="#9AD3F2"/>`),
  W_ROCKS: S(`<path d="M10 64 h52" fill="none"/>
    <path d="M14 64 V38 q4 -6 8 0 V64z" fill="#B97A57"/><ellipse cx="18" cy="33" rx="6" ry="5" fill="#7A5A44"/>
    <path d="M30 64 V28 q5 -6 10 0 V64z" fill="#C98A64"/><ellipse cx="35" cy="22" rx="7" ry="6" fill="#7A5A44"/>
    <path d="M48 64 V42 q4 -6 8 0 V64z" fill="#B97A57"/><ellipse cx="52" cy="37" rx="6" ry="5" fill="#7A5A44"/>`),
};
