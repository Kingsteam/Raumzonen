/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = globalThis, xe = ne.ShadowRoot && (ne.ShadyCSS === void 0 || ne.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ye = Symbol(), Ee = /* @__PURE__ */ new WeakMap();
let tt = class {
  constructor(t, n, s) {
    if (this._$cssResult$ = !0, s !== ye) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (xe && t === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (t = Ee.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Ee.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const dt = (e) => new tt(typeof e == "string" ? e : e + "", void 0, ye), pt = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((s, i, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[r + 1], e[0]);
  return new tt(n, e, ye);
}, ft = (e, t) => {
  if (xe) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const s = document.createElement("style"), i = ne.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, e.appendChild(s);
  }
}, Te = xe ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const s of t.cssRules) n += s.cssText;
  return dt(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: mt, defineProperty: gt, getOwnPropertyDescriptor: bt, getOwnPropertyNames: $t, getOwnPropertySymbols: vt, getPrototypeOf: xt } = Object, oe = globalThis, Pe = oe.trustedTypes, yt = Pe ? Pe.emptyScript : "", wt = oe.reactiveElementPolyfillSupport, q = (e, t) => e, re = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? yt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let n = e;
  switch (t) {
    case Boolean:
      n = e !== null;
      break;
    case Number:
      n = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(e);
      } catch {
        n = null;
      }
  }
  return n;
} }, we = (e, t) => !mt(e, t), Oe = { attribute: !0, type: String, converter: re, reflect: !1, useDefault: !1, hasChanged: we };
Symbol.metadata ??= Symbol("metadata"), oe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let N = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = Oe) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, n);
      i !== void 0 && gt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, n, s) {
    const { get: i, set: r } = bt(this.prototype, t) ?? { get() {
      return this[n];
    }, set(a) {
      this[n] = a;
    } };
    return { get: i, set(a) {
      const o = i?.call(this);
      r?.call(this, a), this.requestUpdate(t, o, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(q("elementProperties"))) return;
    const t = xt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(q("properties"))) {
      const n = this.properties, s = [...$t(n), ...vt(n)];
      for (const i of s) this.createProperty(i, n[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const n = litPropertyMetadata.get(t);
      if (n !== void 0) for (const [s, i] of n) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, s] of this.elementProperties) {
      const i = this._$Eu(n, s);
      i !== void 0 && this._$Eh.set(i, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const n = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) n.unshift(Te(i));
    } else t !== void 0 && n.push(Te(t));
    return n;
  }
  static _$Eu(t, n) {
    const s = n.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const s of n.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ft(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, n, s) {
    this._$AK(t, s);
  }
  _$ET(t, n) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : re).toAttribute(n, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : re;
      this._$Em = i;
      const o = a.fromAttribute(n, r.type);
      this[i] = o ?? this._$Ej?.get(i) ?? o, this._$Em = null;
    }
  }
  requestUpdate(t, n, s, i = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (r = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? we)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, n, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, n, { useDefault: s, reflect: i, wrapped: r }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? n ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (n = void 0), this._$AL.set(t, n)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, r] of s) {
        const { wrapped: a } = r, o = this[i];
        a !== !0 || this._$AL.has(i) || o === void 0 || this.C(i, void 0, r, o);
      }
    }
    let t = !1;
    const n = this._$AL;
    try {
      t = this.shouldUpdate(n), t ? (this.willUpdate(n), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(n)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(n);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((n) => n.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((n) => this._$ET(n, this[n])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
N.elementStyles = [], N.shadowRootOptions = { mode: "open" }, N[q("elementProperties")] = /* @__PURE__ */ new Map(), N[q("finalized")] = /* @__PURE__ */ new Map(), wt?.({ ReactiveElement: N }), (oe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis, He = (e) => e, ae = ke.trustedTypes, De = ae ? ae.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, nt = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, st = "?" + T, kt = `<${st}>`, D = document, X = () => D.createComment(""), J = (e) => e === null || typeof e != "object" && typeof e != "function", ze = Array.isArray, zt = (e) => ze(e) || typeof e?.[Symbol.iterator] == "function", de = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ie = /-->/g, Ce = />/g, P = RegExp(`>|${de}(?:([^\\s"'>=/]+)(${de}*=${de}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Le = /'/g, Ne = /"/g, it = /^(?:script|style|textarea|title)$/i, rt = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), c = rt(1), b = rt(2), Z = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), Fe = /* @__PURE__ */ new WeakMap(), H = D.createTreeWalker(D, 129);
function at(e, t) {
  if (!ze(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return De !== void 0 ? De.createHTML(t) : t;
}
const _t = (e, t) => {
  const n = e.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = W;
  for (let o = 0; o < n; o++) {
    const l = e[o];
    let h, d, p = -1, $ = 0;
    for (; $ < l.length && (a.lastIndex = $, d = a.exec(l), d !== null); ) $ = a.lastIndex, a === W ? d[1] === "!--" ? a = Ie : d[1] !== void 0 ? a = Ce : d[2] !== void 0 ? (it.test(d[2]) && (i = RegExp("</" + d[2], "g")), a = P) : d[3] !== void 0 && (a = P) : a === P ? d[0] === ">" ? (a = i ?? W, p = -1) : d[1] === void 0 ? p = -2 : (p = a.lastIndex - d[2].length, h = d[1], a = d[3] === void 0 ? P : d[3] === '"' ? Ne : Le) : a === Ne || a === Le ? a = P : a === Ie || a === Ce ? a = W : (a = P, i = void 0);
    const y = a === P && e[o + 1].startsWith("/>") ? " " : "";
    r += a === W ? l + kt : p >= 0 ? (s.push(h), l.slice(0, p) + nt + l.slice(p) + T + y) : l + T + (p === -2 ? o : y);
  }
  return [at(e, r + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Y {
  constructor({ strings: t, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const o = t.length - 1, l = this.parts, [h, d] = _t(t, n);
    if (this.el = Y.createElement(h, s), H.currentNode = this.el.content, n === 2 || n === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = H.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(nt)) {
          const $ = d[a++], y = i.getAttribute(p).split(T), z = /([.?@])?(.*)/.exec($);
          l.push({ type: 1, index: r, name: z[2], strings: y, ctor: z[1] === "." ? Mt : z[1] === "?" ? St : z[1] === "@" ? Rt : le }), i.removeAttribute(p);
        } else p.startsWith(T) && (l.push({ type: 6, index: r }), i.removeAttribute(p));
        if (it.test(i.tagName)) {
          const p = i.textContent.split(T), $ = p.length - 1;
          if ($ > 0) {
            i.textContent = ae ? ae.emptyScript : "";
            for (let y = 0; y < $; y++) i.append(p[y], X()), H.nextNode(), l.push({ type: 2, index: ++r });
            i.append(p[$], X());
          }
        }
      } else if (i.nodeType === 8) if (i.data === st) l.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(T, p + 1)) !== -1; ) l.push({ type: 7, index: r }), p += T.length - 1;
      }
      r++;
    }
  }
  static createElement(t, n) {
    const s = D.createElement("template");
    return s.innerHTML = t, s;
  }
}
function j(e, t, n = e, s) {
  if (t === Z) return t;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const r = J(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(e), i._$AT(e, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (t = j(e, i._$AS(e, t.values), i, s)), t;
}
class At {
  constructor(t, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: n }, parts: s } = this._$AD, i = (t?.creationScope ?? D).importNode(n, !0);
    H.currentNode = i;
    let r = H.nextNode(), a = 0, o = 0, l = s[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let h;
        l.type === 2 ? h = new Q(r, r.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (h = new Et(r, this, t)), this._$AV.push(h), l = s[++o];
      }
      a !== l?.index && (r = H.nextNode(), a++);
    }
    return H.currentNode = D, i;
  }
  p(t) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, n), n += s.strings.length - 2) : s._$AI(t[n])), n++;
  }
}
class Q {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, n, s, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = n, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && t?.nodeType === 11 && (t = n.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, n = this) {
    t = j(this, t, n), J(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== Z && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : zt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && J(this._$AH) ? this._$AA.nextSibling.data = t : this.T(D.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Y.createElement(at(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new At(i, this), a = r.u(this.options);
      r.p(n), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let n = Fe.get(t.strings);
    return n === void 0 && Fe.set(t.strings, n = new Y(t)), n;
  }
  k(t) {
    ze(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of t) i === n.length ? n.push(s = new Q(this.O(X()), this.O(X()), this, this.options)) : s = n[i], s._$AI(r), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t !== this._$AB; ) {
      const s = He(t).nextSibling;
      He(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class le {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, n, s, i, r) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = n, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(t, n = this, s, i) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = j(this, t, n, 0), a = !J(t) || t !== this._$AH && t !== Z, a && (this._$AH = t);
    else {
      const o = t;
      let l, h;
      for (t = r[0], l = 0; l < r.length - 1; l++) h = j(this, o[s + l], n, l), h === Z && (h = this._$AH[l]), a ||= !J(h) || h !== this._$AH[l], h === u ? t = u : t !== u && (t += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Mt extends le {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class St extends le {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Rt extends le {
  constructor(t, n, s, i, r) {
    super(t, n, s, i, r), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = j(this, t, n, 0) ?? u) === Z) return;
    const s = this._$AH, i = t === u && s !== u || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== u && (s === u || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Et {
  constructor(t, n, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    j(this, t);
  }
}
const Tt = ke.litHtmlPolyfillSupport;
Tt?.(Y, Q), (ke.litHtmlVersions ??= []).push("3.3.3");
const Pt = (e, t, n) => {
  const s = n?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new Q(t.insertBefore(X(), r), r, void 0, n ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _e = globalThis;
class G extends N {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Pt(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Z;
  }
}
G._$litElement$ = !0, G.finalized = !0, _e.litElementHydrateSupport?.({ LitElement: G });
const Ot = _e.litElementPolyfillSupport;
Ot?.({ LitElement: G });
(_e.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ht = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Dt = { attribute: !0, type: String, converter: re, reflect: !1, hasChanged: we }, It = (e = Dt, t, n) => {
  const { kind: s, metadata: i } = n;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(n.name, e), s === "accessor") {
    const { name: a } = n;
    return { set(o) {
      const l = t.get.call(this);
      t.set.call(this, o), this.requestUpdate(a, l, e, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(a, void 0, e, o), o;
    } };
  }
  if (s === "setter") {
    const { name: a } = n;
    return function(o) {
      const l = this[a];
      t.call(this, o), this.requestUpdate(a, l, e, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function ot(e) {
  return (t, n) => typeof n == "object" ? It(e, t, n) : ((s, i, r) => {
    const a = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), a ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(e, t, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function g(e) {
  return ot({ ...e, state: !0, attribute: !1 });
}
const Ct = 25;
function lt(e) {
  return e * Math.PI / 180;
}
function U([e, t], n, [s, i] = [0, 0]) {
  const r = lt(n), a = Math.cos(r), o = Math.sin(r), l = e - s, h = t - i;
  return [s + l * a - h * o, i + l * o + h * a];
}
function ge(e, t) {
  return Math.hypot(e[0] - t[0], e[1] - t[1]);
}
function Lt(e, t) {
  return [Math.round(e[0] / t) * t, Math.round(e[1] / t) * t];
}
function I(e) {
  return [Math.round(e[0] * 10) / 10, Math.round(e[1] * 10) / 10];
}
function se(e, t, n, s) {
  const i = t / 2, r = n / 2;
  return [
    [-i, -r],
    [i, -r],
    [i, r],
    [-i, r]
  ].map((a) => U([e[0] + a[0], e[1] + a[1]], s, e));
}
function Ae(e) {
  const t = e.x0 ?? 0, n = e.y0 ?? 0;
  return e.zellen.map(([s, i]) => ({ x: t + s * e.groesse, y: n + i * e.groesse, s: e.groesse }));
}
function Me(e, t, n = 0, s = 0) {
  return [Math.floor((e[0] - n) / t), Math.floor((e[1] - s) / t)];
}
function F(e) {
  if (e.art === "vieleck") return e.punkte;
  if (e.art === "rechteck") return se(e.mitte, e.breite, e.tiefe, e.winkel);
  const t = Ae(e), n = t.flatMap((l) => [l.x, l.x + l.s]), s = t.flatMap((l) => [l.y, l.y + l.s]);
  if (!n.length) return [];
  const [i, r, a, o] = [Math.min(...n), Math.max(...n), Math.min(...s), Math.max(...s)];
  return [
    [i, a],
    [r, a],
    [r, o],
    [i, o]
  ];
}
function Nt([e, t], n) {
  let s = !1;
  for (let i = 0, r = n.length - 1; i < n.length; r = i++) {
    const [a, o] = n[i], [l, h] = n[r];
    o > t != h > t && e < a + (t - o) * (l - a) / (h - o) && (s = !s);
  }
  return s;
}
function Ze(e, t) {
  if (t.art === "zellen") {
    const [n, s] = Me(e, t.groesse, t.x0 ?? 0, t.y0 ?? 0);
    return t.zellen.some(([i, r]) => i === n && r === s);
  }
  return Nt(e, F(t));
}
function Ft(e) {
  if (!e.length) return [0, 0];
  let t = 0, n = 0, s = 0;
  for (let i = 0, r = e.length - 1; i < e.length; r = i++) {
    const [a, o] = e[r], [l, h] = e[i], d = a * h - l * o;
    t += d, n += (a + l) * d, s += (o + h) * d;
  }
  return Math.abs(t) < 1e-9 ? [e.reduce((i, r) => i + r[0], 0) / e.length, e.reduce((i, r) => i + r[1], 0) / e.length] : [n / (3 * t), s / (3 * t)];
}
function S(e) {
  if (e.art === "rechteck") return e.mitte;
  if (e.art === "zellen") {
    const t = Ae(e), n = t.length || 1;
    return [t.reduce((s, i) => s + i.x + i.s / 2, 0) / n, t.reduce((s, i) => s + i.y + i.s / 2, 0) / n];
  }
  return Ft(e.punkte);
}
function Zt(e) {
  let t = 0;
  for (let n = 0, s = e.length - 1; n < e.length; s = n++)
    t += e[s][0] * e[n][1] - e[n][0] * e[s][1];
  return Math.abs(t) / 2;
}
function ee(e, t, n) {
  return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function jt(e) {
  const t = e.length;
  for (let n = 0; n < t; n++)
    for (let s = n + 1; s < t; s++) {
      if (Math.abs(n - s) === 1 || Math.abs(n - s) === t - 1) continue;
      const [i, r] = [e[n], e[(n + 1) % t]], [a, o] = [e[s], e[(s + 1) % t]];
      if (ee(i, r, a) * ee(i, r, o) < 0 && ee(a, o, i) * ee(a, o, r) < 0) return !0;
    }
  return !1;
}
function be(e) {
  return e.art === "zellen" ? e.zellen.length ? "" : "Keine Zelle gewählt" : e.art === "rechteck" ? e.breite > 0 && e.tiefe > 0 ? "" : "Rechteck ohne Fläche" : e.punkte.length < 3 ? "Mindestens drei Ecken" : jt(e.punkte) ? "Kanten überschneiden sich" : Zt(e.punkte) < 1 ? "Vieleck ohne Fläche" : "";
}
function $e(e, t, n) {
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map((r) => I([r[0] + t, r[1] + n])) };
  if (e.art === "rechteck") return { ...e, mitte: I([e.mitte[0] + t, e.mitte[1] + n]) };
  const s = Math.round(t / e.groesse), i = Math.round(n / e.groesse);
  return { ...e, zellen: e.zellen.map(([r, a]) => [r + s, a + i]) };
}
function ht(e) {
  const t = lt(e);
  return [-Math.sin(t), Math.cos(t)];
}
function je(e, t, n, s, i = 36) {
  const r = [];
  s >= 360 || r.push(e);
  const o = t - s / 2;
  for (let l = 0; l <= i; l++) {
    const h = o + s * l / i, [d, p] = ht(h);
    r.push([e[0] + d * n, e[1] + p * n]);
  }
  return r;
}
function Ut(e, t) {
  const n = U(e, t.winkel);
  return [t.x + n[0], t.y + n[1]];
}
function pe(e, t) {
  const n = Math.atan2(-(t[0] - e[0]), t[1] - e[1]) * 180 / Math.PI;
  return Math.round(n * 10) / 10;
}
function fe(e, t, n) {
  const s = n[0] - t[0], i = n[1] - t[1], r = s * s + i * i;
  if (r === 0) return ge(e, t);
  const a = Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r));
  return ge(e, [t[0] + a * s, t[1] + a * i]);
}
function Wt(e, t) {
  return U([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function Bt(e, t, n) {
  const s = (i) => I(Ut(Wt(i, t), n));
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map(s) };
  if (e.art === "rechteck") {
    let i = e.winkel + n.winkel - t.winkel;
    return i > 180 && (i -= 360), i <= -180 && (i += 360), { ...e, mitte: s(e.mitte), winkel: Math.round(i * 10) / 10 };
  }
  return t.winkel !== n.winkel ? e : $e(e, n.x - t.x, n.y - t.y);
}
function R(e, t) {
  const [n, s] = U(e, t.winkel);
  return [n + t.x, s + t.y];
}
function Vt(e, t, n) {
  if (e.length >= 3) return e;
  const s = [n];
  for (const p of t) s.push(...F(p));
  const i = s.map((p) => p[0]), r = s.map((p) => p[1]), a = 40, [o, l] = [Math.min(...i) - a, Math.max(...i) + a], [h, d] = [Math.min(...r) - a, Math.max(...r) + a];
  return [
    [o, h],
    [l, h],
    [l, d],
    [o, d]
  ];
}
function Kt(e, t = 100) {
  const n = {};
  let s = -1 / 0;
  for (const i of e)
    if (i.lage) {
      n[i.id] = i.lage;
      for (const r of i.outline) s = Math.max(s, R(r, i.lage)[0]);
    }
  s === -1 / 0 && (s = -t);
  for (const i of e) {
    if (i.lage) continue;
    const r = Math.min(...i.outline.map((l) => l[0])), a = Math.max(...i.outline.map((l) => l[0])), o = { x: s + t - r, y: 0, winkel: 0 };
    n[i.id] = o, s = o.x + a;
  }
  return n;
}
const ct = {
  normal: "normal",
  ausgang: "ausgang",
  hundeplatz: "hundeplatz",
  stoerquelle: "stoerquelle",
  stelle: "stelle",
  durchgang: "durchgang"
};
class qt {
  constructor(t = 100) {
    this.limit = t, this.stack = [];
  }
  push(t) {
    const n = JSON.stringify(t);
    this.stack[this.stack.length - 1] !== n && (this.stack.push(n), this.stack.length > this.limit && this.stack.shift());
  }
  undo() {
    const t = this.stack.pop();
    return t === void 0 ? void 0 : JSON.parse(t);
  }
  get size() {
    return this.stack.length;
  }
  clear() {
    this.stack = [];
  }
}
function ut(e, t) {
  const n = new Set(t.map((i) => i.name));
  if (!n.has(e)) return e;
  let s = 2;
  for (; n.has(`${e} ${s}`); ) s++;
  return `${e} ${s}`;
}
function Gt(e, t, n, s = "normal") {
  return {
    name: ut("Zone", t),
    art: s,
    form: e,
    regel: { ...n[ct[s]] }
  };
}
function Xt(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s[t] = I(n), { ...e, punkte: s };
}
function Ue(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s.splice(t + 1, 0, I(n)), { ...e, punkte: s };
}
function Jt(e, t) {
  return e.art !== "vieleck" || e.punkte.length <= 3 ? e : { ...e, punkte: e.punkte.filter((n, s) => s !== t) };
}
function We(e, t, n) {
  const [s, i] = Me(t, e.groesse, e.x0 ?? 0, e.y0 ?? 0), r = e.zellen.some(([a, o]) => a === s && o === i);
  return n && !r ? { ...e, zellen: [...e.zellen, [s, i]] } : !n && r ? { ...e, zellen: e.zellen.filter(([a, o]) => a !== s || o !== i) } : e;
}
function Be(e, t) {
  return {
    art: "rechteck",
    mitte: I([(e[0] + t[0]) / 2, (e[1] + t[1]) / 2]),
    breite: Math.round(Math.abs(t[0] - e[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(t[1] - e[1]) * 10) / 10,
    winkel: 0
  };
}
function Yt(e) {
  for (const t of e) {
    if (!t.name.trim()) return "Eine Zone hat keinen Namen";
    const n = be(t.form);
    if (n) return `${t.name}: ${n}`;
  }
  return "";
}
function Qt(e, t, n) {
  const s = e.name.toLowerCase(), i = s.includes("bett"), a = s.includes("tür") || s.includes("tuer") || s.includes("door") ? "ausgang" : "normal";
  return {
    name: ut(e.name, t),
    art: a,
    form: e.form,
    regel: { ...n[i ? "bett" : ct[a]] }
  };
}
const ve = [
  {
    rolle: "bett",
    name: "Bett",
    icon: "mdi:bed",
    art: "normal",
    vorlage: "bett",
    text: "Hält einen Schläfer, auch wenn der Sensor springt oder ihn kurz verliert. Frei erst, wenn jemand wirklich aufsteht."
  },
  {
    rolle: "bereich",
    name: "Bereich",
    icon: "mdi:sofa-outline",
    art: "normal",
    vorlage: "normal",
    text: "Belegt, solange jemand darin ist, z. B. Sofa, Schreibtisch oder Schrank."
  },
  {
    rolle: "durchgang",
    name: "Durchgang",
    icon: "mdi:walk",
    art: "durchgang",
    vorlage: "durchgang",
    text: "Hier geht man nur durch, z. B. ein Gang oder der Platz vor dem Schrank. Belegt sofort, frei kurz danach."
  },
  {
    rolle: "tuer",
    name: "Tür",
    icon: "mdi:door-open",
    art: "ausgang",
    vorlage: "ausgang",
    text: "Wer hierhin geht, verlässt den Raum. Hilft dem Bett, „aufgestanden“ schnell zu erkennen."
  },
  {
    rolle: "stelle",
    name: "Stelle",
    icon: "mdi:map-marker-radius-outline",
    art: "stelle",
    vorlage: "stelle",
    text: "Ein Platz zum Beobachten, z. B. Sessel, Ofen oder Futternapf. Zeigt, ob dort jemand ist; daraus lernt Raumzonen später."
  },
  {
    rolle: "hund",
    name: "Hundeplatz",
    icon: "mdi:dog-side",
    art: "hundeplatz",
    vorlage: "hundeplatz",
    text: "Nur ein Hinweis: Wer hier lange ruhig liegt, ist vermutlich der Hund."
  },
  {
    rolle: "ignorieren",
    name: "Ignorieren",
    icon: "mdi:fan",
    art: "stoerquelle",
    vorlage: "stoerquelle",
    text: "Vorhang, Ventilator oder Pflanze: Punkte hier zählen nirgends."
  }
];
function ie(e) {
  return ve.find((t) => t.rolle === e) ?? ve[1];
}
function B(e) {
  return e.art === "ausgang" ? "tuer" : e.art === "hundeplatz" ? "hund" : e.art === "stelle" ? "stelle" : e.art === "durchgang" ? "durchgang" : e.art === "stoerquelle" ? "ignorieren" : e.regel.schlaefer_halten ? "bett" : "bereich";
}
function en(e, t, n) {
  const s = ie(t), i = { ...e, art: s.art, regel: { ...n[s.vorlage] } };
  return s.art !== "ausgang" && delete i.fuehrt_zu, i;
}
function Ve(e) {
  return e === 0 ? "sofort" : `nach ${String(e).replace(".", ",")} s`;
}
function Ke(e) {
  const t = e.regel;
  if (e.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const n = [`belegt ${Ve(t.belegt_nach_s)}`, `frei ${Ve(t.frei_nach_s)}`];
  t.schlaefer_halten && n.push("hält Schläfer"), t.max_personen === 1 && n.push("eine Person"), t.hund_ignorieren && n.push("ohne Hund");
  const s = n.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}
function tn(e, t, n, s = 10) {
  const i = e.breite / 2, r = e.tiefe / 2, a = [
    t === 0 || t === 3 ? e.mitte[0] + i : e.mitte[0] - i,
    t === 0 || t === 1 ? e.mitte[1] + r : e.mitte[1] - r
  ], o = Math.max(s, Math.abs(n[0] - a[0])), l = Math.max(s, Math.abs(n[1] - a[1])), h = n[0] >= a[0] ? 1 : -1, d = n[1] >= a[1] ? 1 : -1;
  return {
    ...e,
    winkel: 0,
    breite: Math.round(o * 10) / 10,
    tiefe: Math.round(l * 10) / 10,
    mitte: I([a[0] + h * o / 2, a[1] + d * l / 2])
  };
}
function nn(e, t) {
  const n = e.fuehrt_zu ?? "";
  return n ? n === "aussen" ? "nach draußen oder in einen Raum ohne Sensor" : t.find((s) => s.id === n)?.name ?? "unbekannter Raum" : "noch nicht eingetragen";
}
function sn(e) {
  let t = (e % 360 + 540) % 360 - 180;
  return t === -180 && (t = 180), t;
}
const me = (e) => Math.round(e * 10) / 10 + 0;
function qe(e, t, n) {
  return e.art === "vieleck" ? { ...e, punkte: e.punkte.map((s) => U(s, n, t).map((i) => me(i))) } : e.art === "rechteck" ? { ...e, mitte: U(e.mitte, n, t).map((s) => me(s)), winkel: me(sn(e.winkel + n)) } : e;
}
function L(e) {
  return e.map((t, n) => {
    const s = e[(n + 1) % e.length];
    return [(t[0] + s[0]) / 2, (t[1] + s[1]) / 2];
  });
}
function he(e, t) {
  return [e[t], e[(t + 1) % e.length]];
}
function Ge(e, t, n) {
  const [s, i] = he(e, t), r = i[0] - s[0], a = i[1] - s[1], o = Math.hypot(r, a);
  if (!o) return 0;
  const l = ((n[0] - s[0]) * r + (n[1] - s[1]) * a) / o;
  return Math.max(0, Math.min(o, l));
}
function rn(e, t, n, s, i = 20) {
  const [r, a] = he(e, t), o = Math.hypot(a[0] - r[0], a[1] - r[1]);
  let l = Math.round(Ge(e, t, n) / 5) * 5, h = Math.round(Ge(e, t, s) / 5) * 5;
  return h < l && ([l, h] = [h, l]), h - l < i ? null : { kante: t, von: l, bis: Math.min(h, Math.floor(o)), art: "tuer" };
}
function Xe(e, t) {
  const [n, s] = he(e, t.kante), i = Math.hypot(s[0] - n[0], s[1] - n[1]) || 1, r = (a) => [n[0] + (s[0] - n[0]) * a / i, n[1] + (s[1] - n[1]) * a / i];
  return [r(t.von), r(t.bis)];
}
function Je(e, t, n) {
  const s = [];
  for (const i of e)
    if (t.inserted !== void 0) {
      if (i.kante === t.inserted) continue;
      s.push(i.kante > t.inserted ? { ...i, kante: i.kante + 1 } : i);
    } else if (t.removed !== void 0) {
      const r = (t.removed - 1 + n) % n;
      if (i.kante === t.removed || i.kante === r) continue;
      s.push(i.kante > t.removed ? { ...i, kante: i.kante - 1 } : i);
    }
  return s;
}
function an(e, t, n = 20) {
  const s = [];
  for (const i of t) {
    if (i.kante >= e.length) continue;
    const [r, a] = he(e, i.kante), o = Math.floor(Math.hypot(a[0] - r[0], a[1] - r[1])), l = Math.min(i.bis, o);
    l - i.von >= n && s.push({ ...i, bis: l });
  }
  return s;
}
const on = pt`
  :host {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--primary-background-color, #fafafa);
    color: var(--primary-text-color, #212121);
    font-family: var(--paper-font-body1_-_font-family, Roboto, "Noto Sans", sans-serif);
    --accent: var(--accent-color, var(--primary-color, #e3a23a));
    --card: var(--card-background-color, #fff);
    --line: var(--divider-color, rgba(0, 0, 0, 0.12));
    --muted: var(--secondary-text-color, #727272);
    --bad: var(--error-color, #db4437);
    --ok: var(--success-color, #43a047);
    --radius: 8px;
    --border: var(--ha-card-border-color, var(--divider-color));
    /* Rollen der Zonen nach Farbgruppen (GUI-Konzept, Abschnitt 2):
       Schlafen = purple, Präsenz/Haus = teal/cyan, Schlösser/Türen = green,
       Wärme/Küche (Ofen) = orange, Hund = amber, ignoriert = inaktiv. */
    --rz-bett: var(--purple-color, #926bc7);
    --rz-bereich: var(--teal-color, #009688);
    --rz-durchgang: var(--cyan-color, #00bcd4);
    --rz-tuer: var(--green-color, #4caf50);
    --rz-stelle: var(--orange-color, #ff9800);
    --rz-hund: var(--amber-color, #ffc107);
    --rz-ignorieren: var(--state-inactive-color, #b3aa9c);
    /* Figuren: Mensch in der Haus-Farbe, vermutlich Hund amber */
    --rz-person: var(--teal-color, #009688);
    --rz-tier: var(--amber-color, #ffc107);
    --rz-heat: var(--rgb-deep-orange-color, 255, 87, 34);
  }
  * {
    box-sizing: border-box;
  }
  ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Kopfzeile */
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--header-height, 56px);
    padding: 0 12px;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    border-bottom: 2px solid var(--divider-color);
    flex-shrink: 0;
  }
  header .title {
    font-size: 20px;
    font-weight: 400;
    margin-left: 4px;
    white-space: nowrap;
  }
  header .menu {
    display: none;
  }
  :host([narrow]) header .menu {
    display: inline-flex;
  }
  :host([narrow]) header .title {
    display: none;
  }
  header .spacer {
    flex: 1;
  }
  header button.icon,
  header button.text {
    color: inherit;
  }
  header button:disabled {
    opacity: 0.45;
  }
  header button.primary {
    background: color-mix(in srgb, currentColor 10%, transparent);
    color: inherit;
  }
  header button.primary:not(:disabled) {
    /* einzige gefüllte Hauptaktion: Tinte als Fläche */
    background: var(--primary-text-color);
    color: var(--card-background-color, #fff);
  }
  .pages {
    display: flex;
    gap: 2px;
    margin-left: 16px;
    background: color-mix(in srgb, currentColor 8%, transparent);
    border-radius: 999px;
    padding: 3px;
    overflow-x: auto;
    scrollbar-width: none;
    min-width: 0;
  }
  .pages button {
    color: inherit;
    padding: 5px 14px;
    font-size: 14px;
    gap: 6px;
    white-space: nowrap;
  }
  .pages button.active {
    background: var(--card);
    color: var(--accent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }
  :host([narrow]) .pages {
    margin-left: 4px;
  }
  .live-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 13px;
    background: color-mix(in srgb, currentColor 8%, transparent);
    white-space: nowrap;
  }
  .live-chip .led {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bad);
  }
  .live-chip.down {
    /* nicht erreichbar: gestrichelt, nie leer oder „aus“ (GUI-Konzept 7) */
    outline: 2px dashed var(--state-inactive-color, #b3aa9c);
    outline-offset: -2px;
    color: var(--secondary-text-color);
  }
  .live-chip.ok .led {
    background: var(--ok);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 25%, transparent);
  }
  :host([narrow]) .live-chip .text,
  :host([narrow]) header .label {
    display: none;
  }

  /* Knöpfe */
  button {
    font: inherit;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    background: none;
    color: var(--accent);
    transition: background 0.15s;
  }
  button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  button.icon {
    width: 40px;
    height: 40px;
    justify-content: center;
    color: var(--primary-text-color);
  }
  button.icon:hover:not(:disabled),
  button.text:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 10%, transparent);
  }
  button.text {
    padding: 7px 12px;
    font-weight: 500;
    font-size: 14px;
  }
  button.text.small {
    padding: 4px 10px;
    font-size: 13px;
  }
  button.text.danger {
    color: var(--bad);
  }
  button.primary {
    padding: 8px 16px;
    font-weight: 500;
    background: var(--primary-text-color);
    color: var(--card);
  }

  /* Aufteilung */
  .layout {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .stage {
    position: relative;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    background: var(--secondary-background-color, #e5e5e5);
    touch-action: none;
  }
  .side {
    width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border-left: 1px solid var(--line);
    min-height: 0;
  }
  :host([narrow]) .layout {
    flex-direction: column;
  }
  :host([narrow]) .stage {
    flex: none;
    height: 58vh;
  }
  :host([narrow]) .side {
    width: auto;
    flex: 1;
    border-left: none;
    border-top: 1px solid var(--line);
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
  }
  .tabs button {
    flex: 1;
    justify-content: center;
    border-radius: 0;
    padding: 14px 8px 12px;
    color: var(--muted);
    border-bottom: 2px solid transparent;
    font-weight: 500;
  }
  .tabs button.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
  .side-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 24px;
  }
  h3 {
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin: 20px 4px 8px;
  }
  .hint {
    color: var(--muted);
    line-height: 1.45;
    margin: 12px 4px;
    font-size: 14px;
  }
  .hint.small {
    font-size: 12.5px;
    margin: 6px 0;
  }
  .note {
    font-size: 13px;
    line-height: 1.45;
    padding: 8px 12px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    margin: 8px 0;
  }
  .note.warn {
    background: color-mix(in srgb, var(--bad) 12%, transparent);
  }

  /* Liste der Zonen */
  .list {
    list-style: none;
    padding: 0;
    margin: 4px 0;
  }
  .item {
    border-radius: 10px;
    margin: 2px 0;
    transition: background 0.15s;
  }
  .item.open {
    background: color-mix(in srgb, var(--zone, var(--accent)) 9%, transparent);
    box-shadow: inset 3px 0 0 var(--zone, var(--accent));
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    cursor: pointer;
    border-radius: 10px;
  }
  .row:hover {
    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--zone);
    flex-shrink: 0;
  }
  .row ha-icon {
    color: var(--muted);
  }
  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }
  .name small {
    display: block;
    color: var(--muted);
    font-weight: 400;
    font-size: 12px;
    white-space: normal;
  }
  .badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .badge.on {
    background: color-mix(in srgb, var(--zone, var(--accent)) 18%, transparent);
    color: var(--primary-text-color);
    box-shadow: inset 0 0 0 2px var(--zone, var(--accent));
  }
  .badge.off {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    color: var(--muted);
  }
  .badge.unreachable {
    outline: 2px dashed var(--state-inactive-color, #b3aa9c);
    outline-offset: -2px;
  }
  .badge.new {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
  }
  .inspector {
    padding: 0 12px 12px 30px;
  }
  .field {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: var(--muted);
    gap: 3px;
    position: relative;
    flex: 1;
    min-width: 0;
    margin: 8px 0;
  }
  .field .unit {
    position: absolute;
    right: 10px;
    bottom: 9px;
    font-size: 13px;
  }
  .fields {
    display: flex;
    gap: 8px;
  }
  .fields .field {
    margin: 4px 0;
  }
  input,
  select {
    font: inherit;
    font-size: 14px;
    color: var(--primary-text-color);
    background: var(--input-fill-color, color-mix(in srgb, var(--primary-text-color) 5%, transparent));
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 8px 10px;
    width: 100%;
    min-width: 0;
  }
  input:focus,
  select:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  .field input {
    padding-right: 30px;
  }
  .label-text {
    font-size: 12px;
    color: var(--muted);
    margin: 10px 0 4px;
  }
  .levels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .levels button {
    padding: 5px 10px;
    font-size: 12.5px;
    border: 1px solid var(--line);
    color: var(--primary-text-color);
  }
  .levels button ha-icon {
    --mdc-icon-size: 16px;
  }
  .levels button.active {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border-color: var(--accent);
    color: var(--primary-text-color);
  }
  /* Auswertung: Zeitleisten */
  .ausw .item {
    padding-bottom: 8px;
  }
  .row.static {
    cursor: default;
  }
  .row.static:hover {
    background: none;
  }
  .dauer {
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    font-size: 13px;
    white-space: nowrap;
  }
  svg.leiste {
    display: block;
    width: calc(100% - 38px);
    height: 10px;
    margin: 0 8px 0 30px;
  }
  .leiste-grund {
    fill: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }
  .achse {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--muted);
    margin: 0 8px 8px 30px;
  }
  image.heat {
    pointer-events: none;
  }
  .summary {
    font-size: 13px;
    line-height: 1.45;
    margin: 10px 0 4px;
  }
  .check {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 8px 0;
    font-size: 14px;
    cursor: pointer;
  }
  .check input {
    width: 18px;
    height: 18px;
    flex: none;
    margin: 1px 0 0;
    accent-color: var(--accent);
  }
  .check small {
    display: block;
    color: var(--muted);
    font-size: 12px;
  }
  details.fine {
    margin: 8px 0 0;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 6px 10px;
  }
  details.fine summary {
    cursor: pointer;
    color: var(--accent);
    font-weight: 500;
    font-size: 14px;
    padding: 2px 0;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
  }
  .actions .spacer {
    flex: 1;
  }
  .marker-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--rz-bereich) 15%, transparent);
    border-radius: 50%;
  }
  .marker-icon ha-icon {
    --mdc-icon-size: 16px;
    color: var(--rz-bereich);
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    margin: 4px 0 8px;
    font-size: 13.5px;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
  }

  /* Plan */
  svg.plan {
    display: block;
    width: 100%;
    height: 100%;
    user-select: none;
    -webkit-user-select: none;
  }
  svg.plan.drawing {
    cursor: crosshair;
  }
  svg.plan.painting {
    cursor: cell;
  }
  .grid {
    stroke: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    stroke-width: 1;
  }
  .grid.major {
    stroke: color-mix(in srgb, var(--primary-text-color) 15%, transparent);
  }
  .floor {
    fill: color-mix(in srgb, var(--card) 75%, transparent);
  }
  .floor.belegt {
    fill: color-mix(in srgb, var(--rz-bereich) 22%, var(--card));
  }
  /* Raum hinzufügen */
  .neu-raum {
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px 12px;
    margin: 8px 0 12px;
  }
  .melder-liste {
    list-style: none;
    margin: 4px 0;
    padding: 0;
    max-height: 260px;
    overflow: auto;
  }
  .melder-liste .check {
    margin: 4px 0;
  }
  .melder-liste small {
    color: var(--muted);
    display: block;
  }
  .wall {
    fill: none;
    stroke: var(--secondary-text-color, #665e54);
    stroke-width: 6;
    stroke-linejoin: round;
  }
  .coverage {
    fill: color-mix(in srgb, var(--accent) 9%, transparent);
    stroke: color-mix(in srgb, var(--accent) 55%, transparent);
    stroke-width: 1.5;
    stroke-dasharray: 6 5;
    pointer-events: none;
  }
  .zone-shape {
    stroke-width: 2;
    stroke-linejoin: round;
    cursor: pointer;
  }
  .zone-shape.selected {
    stroke-width: 3;
  }
  .label {
    text-anchor: middle;
    fill: var(--primary-text-color);
    stroke: var(--card);
    stroke-width: 3px;
    paint-order: stroke;
    stroke-linejoin: round;
    font-weight: 600;
    font-size: 13px;
    pointer-events: none;
  }
  .label .sub {
    font-weight: 400;
    font-size: 12px;
  }
  .handle {
    fill: var(--card);
    stroke: var(--accent);
    stroke-width: 2.5;
    cursor: move;
  }
  .handle.angle {
    fill: var(--accent);
    stroke: var(--primary-text-color);
    cursor: grab;
  }
  .sensor-body {
    fill: var(--primary-text-color);
    stroke: var(--card);
    stroke-width: 2;
    cursor: move;
  }
  .sensor-wave {
    fill: none;
    stroke: var(--card);
    stroke-width: 1.6;
    stroke-linecap: round;
    pointer-events: none;
  }
  .sensor-line {
    stroke: var(--secondary-text-color);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
  }
  .figure {
    stroke: var(--card);
    stroke-width: 2.5;
  }
  .figure.held {
    fill: none;
    stroke-dasharray: 4 3;
    stroke-width: 2;
  }
  .trail {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.45;
  }
  .target {
    stroke: var(--muted);
    stroke-width: 1.5;
  }
  .draft {
    fill: color-mix(in srgb, var(--rz-bereich) 15%, transparent);
    stroke: var(--primary-text-color);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
  }
  .draft-dot {
    fill: var(--primary-text-color);
  }
  .close-ring {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.5;
  }

  /* Werkzeuge am Plan */
  .tools {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
  .tools button.icon {
    border-radius: 0;
  }
  .tools button.on {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .tools .sep {
    height: 1px;
    background: var(--line);
    margin: 2px 6px;
  }
  :host([narrow]) .tools {
    flex-direction: row;
    top: 8px;
    left: 8px;
    max-width: calc(100% - 16px);
    overflow-x: auto;
  }
  :host([narrow]) .tools button.icon {
    width: 36px;
    height: 36px;
    flex: none;
  }
  :host([narrow]) .tools .sep {
    width: 1px;
    height: auto;
    margin: 6px 2px;
  }
  :host([narrow]) .layers {
    top: 52px;
    left: 8px;
  }
  .layers {
    position: absolute;
    top: 12px;
    left: 64px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
    padding: 8px 12px;
    min-width: 240px;
    z-index: 3;
  }
  .layers .check {
    margin: 4px 0;
  }
  .scalebar {
    position: absolute;
    left: 12px;
    bottom: 12px;
    font-size: 12px;
    background: color-mix(in srgb, var(--card) 85%, transparent);
    padding: 4px 8px;
    border-radius: 6px;
    pointer-events: none;
  }
  .scalebar div {
    height: 6px;
    border: 2px solid var(--primary-text-color);
    border-top: none;
    margin-bottom: 2px;
  }
  .bubble {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 10px 10px 16px;
    background: var(--card);
    border-radius: var(--radius);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    line-height: 1.4;
    width: max-content;
    max-width: min(92%, 640px);
  }
  .bubble ha-icon {
    --mdc-icon-size: 26px;
    color: var(--accent);
    flex: none;
  }
  .bubble .grow {
    flex: 1;
  }
  :host([narrow]) .bubble {
    font-size: 13px;
    bottom: 12px;
  }
  .toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    background: var(--primary-text-color);
    color: var(--card-background-color, #fff);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
    font-size: 14px;
    z-index: 10;
    max-width: 90vw;
  }
  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    text-align: center;
    padding: 24px;
    line-height: 1.5;
  }
  .empty ha-icon {
    --mdc-icon-size: 48px;
  }
  .empty p {
    max-width: 520px;
  }

  /* Hausplan */
  .wall.guess {
    stroke-dasharray: 6 5;
    stroke-width: 2;
  }
  .wall.selected {
    stroke: var(--accent);
  }
  .label.room {
    font-size: 15px;
    font-weight: 600;
  }
  .link {
    stroke: var(--rz-tuer);
    stroke-width: 3;
    stroke-dasharray: 2 6;
    stroke-linecap: round;
  }
  .link-dot {
    fill: var(--rz-tuer);
    stroke: var(--card);
    stroke-width: 2;
  }
  .pages button ha-icon {
    --mdc-icon-size: 18px;
    margin-right: 4px;
  }
  ul.doors {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li.door {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  li.door .field {
    flex: 1;
  }

  /* Öffnungen in Wänden, Punkte einfügen */
  .wall-gap {
    stroke: var(--card);
    stroke-width: 9;
  }
  .opening .door-leaf {
    stroke: var(--secondary-text-color, #665e54);
    stroke-width: 2.5;
  }
  .opening .door-arc,
  .opening .opening-line {
    fill: none;
    stroke: var(--secondary-text-color, #665e54);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  .opening.selected .door-leaf,
  .opening.selected .door-arc,
  .opening.selected .opening-line {
    stroke: var(--accent);
  }
  .plus circle {
    fill: var(--card);
    stroke: var(--accent);
    stroke-width: 1.5;
    cursor: copy;
  }
  .plus path {
    stroke: var(--accent);
    stroke-width: 1.5;
    pointer-events: none;
  }
  .handle.on {
    fill: var(--accent);
  }

  /* Trefferflächen für Finger (GUI-Konzept 3): Handy 44 px, Wand-Tablet 56 px */
  @media (pointer: coarse) {
    button,
    .levels button,
    select,
    input {
      min-height: 44px;
    }
    .tools button.icon {
      min-width: 44px;
    }
  }
  @media (pointer: coarse) and (min-width: 1000px) {
    button,
    .levels button {
      min-height: 56px;
    }
  }
`, Ye = 600;
function ln(e) {
  const t = Math.max(1, Math.ceil(e * 3)), n = new Float32Array(2 * t + 1);
  let s = 0;
  for (let i = -t; i <= t; i++) {
    const r = Math.exp(-(i * i) / (2 * e * e));
    n[i + t] = r, s += r;
  }
  for (let i = 0; i < n.length; i++) n[i] /= s;
  return n;
}
function hn(e, t, n = 8) {
  if (!e.length || !(t > 0)) return null;
  let s = 1 / 0, i = -1 / 0, r = 1 / 0, a = -1 / 0;
  for (const [x, w] of e)
    s = Math.min(s, x), i = Math.max(i, x), r = Math.min(r, w), a = Math.max(a, w);
  const o = Math.max(0.6, n / t), l = ln(o), h = (l.length - 1) / 2;
  s -= h, r -= h;
  const d = Math.min(Ye, i - s + 1 + h), p = Math.min(Ye, a - r + 1 + h), $ = new Float32Array(d * p);
  for (const [x, w, A] of e) {
    const k = x - s, _ = w - r;
    k >= 0 && k < d && _ >= 0 && _ < p && A > 0 && ($[_ * d + k] += A);
  }
  const y = new Float32Array(d * p);
  for (let x = 0; x < p; x++)
    for (let w = 0; w < d; w++) {
      const A = $[x * d + w];
      if (A)
        for (let k = -h; k <= h; k++) {
          const _ = w + k;
          _ >= 0 && _ < d && (y[x * d + _] += A * l[k + h]);
        }
    }
  const z = new Float32Array(d * p);
  let v = 0;
  for (let x = 0; x < p; x++)
    for (let w = 0; w < d; w++) {
      const A = y[x * d + w];
      if (A)
        for (let k = -h; k <= h; k++) {
          const _ = x + k;
          _ >= 0 && _ < p && (z[_ * d + w] += A * l[k + h]);
        }
    }
  for (let x = 0; x < z.length; x++) v = Math.max(v, z[x]);
  return { x0: s * t, y0: r * t, zelle: t, nx: d, ny: p, werte: z, max: v };
}
function cn(e, t, n = 0.2) {
  return !(e > n) || !(t > 0) ? 0 : Math.min(1, Math.log1p(e) / Math.log1p(t));
}
function un(e, t, n = 0.85) {
  const s = new Uint8ClampedArray(e.nx * e.ny * 4);
  for (let i = 0; i < e.ny; i++) {
    const r = e.ny - 1 - i;
    for (let a = 0; a < e.nx; a++) {
      const o = cn(e.werte[i * e.nx + a], e.max);
      if (!o) continue;
      const l = (r * e.nx + a) * 4;
      s[l] = t[0], s[l + 1] = t[1], s[l + 2] = t[2], s[l + 3] = Math.round(255 * n * (0.15 + 0.85 * o));
    }
  }
  return s;
}
function dn(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e)
    for (const [s, i, r] of n) {
      const a = `${s},${i}`, o = t.get(a);
      o ? o[2] += r : t.set(a, [s, i, r]);
    }
  return [...t.values()];
}
function te(e) {
  if (e < 60) return `${Math.round(e)} s`;
  const t = Math.round(e / 60);
  if (t < 60) return `${t} min`;
  const n = Math.floor(t / 60), s = t % 60;
  return s ? `${n} h ${s} min` : `${n} h`;
}
function pn(e, t) {
  const n = e.length;
  if (n < 3 || t.kante < 0 || t.kante >= n) return null;
  const [s, i] = e[t.kante], [r, a] = e[(t.kante + 1) % n], o = Math.hypot(r - s, a - i);
  if (!o) return null;
  const l = (t.von + t.bis) / 2 / o;
  return [s + (r - s) * l, i + (a - i) * l];
}
function V(e) {
  const t = [];
  for (const n of e.zonen)
    n.art !== "ausgang" || !n.id || t.push({ key: `${e.id}/${n.id}`, raumId: e.id, name: n.name, punkt: S(n.form), ziel: n.fuehrt_zu ?? "", zoneId: n.id });
  return (e.oeffnungen ?? []).forEach((n, s) => {
    const i = pn(e.umriss, n);
    if (!i) return;
    const r = n.art === "offen" ? `Durchgang ${s + 1}` : `Tür ${s + 1} in der Wand`;
    t.push({ key: `${e.id}/#${s}`, raumId: e.id, name: r, punkt: i, ziel: n.fuehrt_zu ?? "", oeffnung: s });
  }), t;
}
function fn(e, t = 60) {
  const n = e.flat().filter(([i, r]) => r > i).sort((i, r) => i[0] - r[0]), s = [];
  for (const [i, r] of n) {
    const a = s[s.length - 1];
    a && i - a[1] <= t ? a[1] = Math.max(a[1], r) : s.push([i, r]);
  }
  return s;
}
function mn(e) {
  return e.reduce((t, [n, s]) => t + (s - n), 0);
}
function gn(e, t = 30) {
  const n = [], s = [];
  for (const [r, a] of Object.entries(e))
    for (const [o, l] of a)
      s.push({ t: o, raum: r }), n.push({ t: l, raum: r });
  s.sort((r, a) => r.t - a.t);
  const i = [];
  for (const r of s) {
    let a;
    for (const o of n)
      o.raum === r.raum || Math.abs(o.t - r.t) > t || (!a || Math.abs(o.t - r.t) < Math.abs(a.t - r.t)) && (a = o);
    a && i.push({ zeit: r.t, von: a.raum, nach: r.raum });
  }
  return i;
}
var bn = Object.defineProperty, $n = Object.getOwnPropertyDescriptor, m = (e, t, n, s) => {
  for (var i = s > 1 ? void 0 : s ? $n(t, n) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (i = (s ? a(t, n, i) : a(i)) || i);
  return s && i && bn(t, n, i), i;
};
const M = "raumzonen", vn = 5, E = 12, Qe = [1, 3, 8, 12, 24], xn = ["auswahl", "umriss", "oeffnung"], O = "anwesenheit", et = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" }
], yn = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung."
};
function K(e) {
  return `var(--rz-${e})`;
}
function wn(e) {
  return e.map((t) => `${t[0].toFixed(1)},${t[1].toFixed(1)}`).join(" ");
}
function kn(e) {
  for (const t of [10, 20, 50, 100, 200, 500, 1e3, 2e3]) if (t >= e) return t;
  return 5e3;
}
let f = class extends G {
  constructor() {
    super(...arguments), this.narrow = !1, this.raumId = "", this.zones = [], this.sensor = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 }, this.umriss = [], this.oeffnungen = [], this.selVertex = -1, this.selOpening = -1, this.openingDraft = null, this.selected = -1, this.sensorOpen = !1, this.tab = "zonen", this.tool = "auswahl", this.draft = [], this.rectDraft = null, this.hover = null, this.view = { cx: 0, cy: 250, scale: 0.8 }, this.size = { w: 800, h: 600 }, this.heatMin = 0, this.auswStunden = 8, this.auswLaedt = !1, this.auswFehler = "", this.neuRaum = null, this.profilStunden = 0, this.profilLaedt = !1, this.auswFigur = "", this.layersOpen = !1, this.layers = { figuren: !0, spuren: !0, ziele: !1, abdeckung: !0 }, this.dirty = !1, this.zonesFollow = !0, this.saving = !1, this.error = "", this.toast = "", this.page = "raum", this.lagen = {}, this.tueren = {}, this.hausLive = {}, this.hausSel = "", this.aufnahme = !0, this.melder = [], this.nachlauf = 0, this.aufnahmeTage = 30, this.history = new qt(), this.drag = null, this.liveRoom = "", this.viewTouched = !1, this.sensorAnchor = null, this.hausUnsubs = [], this.fit = () => {
      const e = this.sensor, t = [[e.x, e.y]];
      if (this.page === "haus" && this.data) {
        t.length = 0;
        for (const p of this.data.raeume) {
          const $ = this.lagen[p.id];
          $ && t.push(...this.outlineOf(p).map((y) => R(y, $)));
        }
      }
      for (const p of this.zones) t.push(...F(p.form));
      t.push(...this.umriss), t.length < 4 && this.page === "raum" && t.push(...je([e.x, e.y], e.winkel, Math.min(e.reichweite_cm, 500), e.oeffnung_grad, 8));
      const n = t.map((p) => p[0]), s = t.map((p) => p[1]), [i, r, a, o] = [Math.min(...n), Math.max(...n), Math.min(...s), Math.max(...s)], l = Math.max(200, r - i), h = Math.max(200, o - a), d = Math.min(this.size.w / (l * 1.2), this.size.h / (h * 1.2));
      this.view = { cx: (i + r) / 2, cy: (a + o) / 2, scale: Math.max(0.05, Math.min(5, d)) };
    }, this.undo = () => {
      const e = this.history.undo();
      e && (this.zones = e.zones, this.sensor = e.sensor, this.umriss = e.umriss, this.oeffnungen = e.oeffnungen ?? [], this.selVertex = -1, this.selOpening = -1, this.selected >= this.zones.length && (this.selected = -1), this.dirty = !0);
    }, this.finishDraft = () => {
      if (this.draft.length >= 3)
        if (this.tool === "umriss")
          this.remember(), this.umriss = this.draft, this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
        else {
          const e = { art: "vieleck", punkte: this.draft }, t = be(e);
          t ? this.showToast(t) : this.addZone(e);
        }
      this.draft = [], this.tool = "auswahl";
    }, this.onKey = (e) => {
      const t = e.composedPath()[0];
      t && ["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName) || !this.kannAendern || this.page === "haus" || (e.key === "Escape" ? this.setTool("auswahl") : e.key === "Enter" && this.draft.length ? this.finishDraft() : e.key === "Backspace" && this.draft.length ? this.draft = this.draft.slice(0, -1) : (e.key === "Delete" || e.key === "Backspace") && this.selOpening >= 0 ? (this.deleteOpening(this.selOpening), e.preventDefault()) : (e.key === "Delete" || e.key === "Backspace") && this.selected >= 0 && this.selVertex >= 0 ? (this.deleteVertex(this.selected, this.selVertex), e.preventDefault()) : (e.key === "Delete" || e.key === "Backspace") && this.selected >= 0 ? (this.deleteZone(this.selected), e.preventDefault()) : (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && (this.undo(), e.preventDefault()));
    }, this.onContextMenu = (e) => {
      if (e.preventDefault(), !this.kannAendern || this.page !== "raum") return;
      const t = this.toWorld(e), n = this.zones[this.selected];
      if (n?.form.art === "vieleck") {
        const i = n.form.punkte.findIndex((r) => this.near(t, r));
        if (i >= 0) {
          this.remember(), this.deleteVertex(this.selected, i);
          return;
        }
      }
      const s = this.umriss.findIndex((i) => this.near(t, i));
      s >= 0 && this.deleteWallCorner(s);
    };
  }
  set hass(e) {
    const t = !this._hass;
    this._hass = e, t && this.load();
  }
  get hass() {
    return this._hass;
  }
  // -- Laden, Live, Speichern ------------------------------------------
  async load() {
    if (this._hass)
      try {
        const e = await this._hass.callWS({ type: `${M}/rooms/get` });
        this.data = e, this.error = "";
        const t = e.raeume.some((n) => n.id === this.raumId);
        this.page === "haus" && e.raeume.length ? (this.raumId = t ? this.raumId : e.raeume[0].id, this.openHaus(!0)) : this.selectRoom(t ? this.raumId : e.raeume[0]?.id ?? "", !0);
      } catch (e) {
        this.error = `Laden fehlgeschlagen: ${e.message ?? e}`;
      }
  }
  /** Nur Admins dürfen ändern; alle anderen sehen nur zu. */
  get kannAendern() {
    return this.data?.darf_aendern !== !1;
  }
  get istMelder() {
    return this.raum?.art === "melder";
  }
  get raum() {
    return this.data?.raeume.find((e) => e.id === this.raumId);
  }
  selectRoom(e, t = !1) {
    if (!t && e === this.raumId && this.page === "raum" || !t && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const n = e !== this.raumId || this.page !== "raum";
    this.page === "haus" && this.unsubscribeHaus(), this.page = "raum", this.raumId = e;
    const s = this.raum;
    if (this.zones = s ? structuredClone(s.zonen) : [], this.umriss = s ? structuredClone(s.umriss) : [], this.oeffnungen = s ? structuredClone(s.oeffnungen ?? []) : [], this.selOpening = -1, this.selVertex = -1, s) {
      const i = s.sensor;
      this.sensor = { x: i.x, y: i.y, winkel: i.winkel, reichweite_cm: i.reichweite_cm, oeffnung_grad: i.oeffnung_grad }, this.aufnahme = s.aufnahme ?? !0, this.aufnahmeTage = s.aufnahme_tage ?? 30, this.melder = [...s.melder ?? []], this.nachlauf = s.melder_nachlauf_s ?? 0, s.art === "melder" && (this.tab === "zonen" && (this.tab = "raum"), this.kandidaten || this.loadKandidaten());
    }
    this.selected = -1, this.sensorOpen = !1, this.draft = [], this.tool = "auswahl", this.dirty = !1, this.history.clear(), n && (this.viewTouched = !1, this.fit()), this.subscribeLive(), this.loadHeat(), n && (this.ausw = void 0, this.auswFigur = "", this.tab === "auswertung" && this.loadAuswertung());
  }
  async subscribeLive() {
    if (!(!this._hass || this.liveRoom === this.raumId) && (await this.unsubscribeLive(), !!this.raumId)) {
      this.liveRoom = this.raumId;
      try {
        this.unsubLive = await this._hass.connection.subscribeMessage((e) => {
          e.raum_id === this.raumId && (this.live = e);
        }, { type: `${M}/live/subscribe`, raum_id: this.raumId });
      } catch {
        this.liveRoom = "", this.live = void 0;
      }
    }
  }
  async unsubscribeLive() {
    const e = this.unsubLive;
    if (this.unsubLive = void 0, this.liveRoom = "", e)
      try {
        await e();
      } catch {
      }
  }
  openTab(e) {
    this.tab = e, window.clearInterval(this.auswTimer), e === "auswertung" && (this.loadAuswertung(), this.auswTimer = window.setInterval(() => void this.loadAuswertung(), 6e4));
  }
  async loadAuswertung() {
    if (!this._hass || !this.raumId || !this.kannAendern) return;
    const e = this.raumId, t = this.auswStunden;
    this.auswLaedt = !0;
    try {
      const n = await this._hass.callWS({ type: `${M}/auswertung/get`, raum_id: e, stunden: t });
      if (e !== this.raumId || t !== this.auswStunden) return;
      this.ausw = n, this.auswFehler = "", this.auswFigur && !n.figuren.some((s) => s.figur === this.auswFigur) && (this.auswFigur = "");
    } catch (n) {
      if (e !== this.raumId) return;
      const s = n;
      this.ausw = void 0, this.auswFehler = s.code === "off" ? "off" : `Auswertung fehlgeschlagen: ${s.message ?? n}`;
    } finally {
      this.auswLaedt = !1;
    }
  }
  async loadHeat() {
    if (window.clearInterval(this.heatTimer), this.heat = void 0, !this._hass || !this.heatMin || !this.raumId) return;
    const e = async () => {
      try {
        this.heat = await this._hass.callWS({ type: `${M}/heat/get`, raum_id: this.raumId, minuten: this.heatMin });
      } catch {
        this.heat = void 0;
      }
    };
    await e(), this.heatTimer = window.setInterval(e, 3e4);
  }
  async save() {
    if (!this._hass || !this.raum || !this.kannAendern) return;
    const e = this.istMelder, t = e ? this.melder.length ? "" : "Mindestens einen Melder wählen." : Yt(this.zones);
    if (t) {
      this.showToast(t);
      return;
    }
    this.saving = !0, this.error = "";
    try {
      await this._hass.callWS({
        type: `${M}/room/save`,
        raum_id: this.raumId,
        zonen: e ? [] : this.zones,
        ...e ? { melder: this.melder, melder_nachlauf_s: this.nachlauf } : { sensor: this.sensor },
        umriss: this.umriss,
        oeffnungen: an(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage
      }), this.dirty = !1, this.showToast("Gespeichert."), await this.unsubscribeLive(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load();
    } catch (n) {
      this.showToast(`Nicht gespeichert: ${n.message ?? n}`);
    } finally {
      this.saving = !1;
    }
  }
  discard() {
    if (this.page === "haus") {
      this.openHaus(!0);
      return;
    }
    this.selectRoom(this.raumId, !0);
  }
  async importConverter() {
    if (!(!this._hass || !this.data))
      try {
        const e = await this._hass.callWS({
          type: `${M}/converter_zones/get`,
          raum_id: this.raumId
        });
        if (!e.zonen.length) {
          this.showToast("Im Konverter sind keine Software-Zonen eingerichtet.");
          return;
        }
        this.remember();
        const t = this.zones.slice();
        for (const n of e.zonen) t.push(Qt(n, t, this.data.vorlagen));
        this.zones = t, this.dirty = !0, this.showToast(`${e.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
      } catch (e) {
        this.showToast(`Konverter-Zonen nicht lesbar: ${e.message ?? e}`);
      }
  }
  // -- Hausplan -------------------------------------------------------------
  outlineOf(e) {
    return e.art === "melder" && e.umriss.length < 3 ? [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300]
    ] : Vt(
      e.umriss,
      e.zonen.map((t) => t.form),
      [e.sensor.x, e.sensor.y]
    );
  }
  openHaus(e = !1) {
    if (!this.data || !e && this.page === "haus" || !e && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const t = this.data.raeume;
    this.lagen = Kt(
      t.map((i) => ({
        id: i.id,
        outline: this.outlineOf(i),
        lage: i.haus_gesetzt ? { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel } : null
      }))
    );
    const n = {};
    for (const i of t) for (const r of V(i)) n[r.key] = r.ziel;
    this.tueren = n;
    const s = this.page === "haus";
    this.page = "haus", this.hausSel = "", this.tool = "auswahl", this.dirty = !1, this.unsubscribeLive(), this.subscribeHaus(), s || (this.viewTouched = !1, this.fit());
  }
  async subscribeHaus() {
    if (await this.unsubscribeHaus(), !(!this._hass || !this.data))
      for (const e of this.data.raeume)
        try {
          const t = await this._hass.connection.subscribeMessage((n) => {
            this.hausLive = { ...this.hausLive, [n.raum_id]: n };
          }, { type: `${M}/live/subscribe`, raum_id: e.id });
          this.hausUnsubs.push(t);
        } catch {
        }
  }
  async unsubscribeHaus() {
    const e = this.hausUnsubs;
    this.hausUnsubs = [], this.hausLive = {};
    for (const t of e)
      try {
        await t();
      } catch {
      }
  }
  turnRoom(e, t) {
    const n = this.lagen[e];
    if (!n) return;
    let s = ((n.winkel + t) % 360 + 540) % 360 - 180;
    s === -180 && (s = 180), this.lagen = { ...this.lagen, [e]: { ...n, winkel: s } }, this.dirty = !0;
  }
  async loadKandidaten() {
    if (!(!this._hass || !this.kannAendern))
      try {
        this.kandidaten = await this._hass.callWS({ type: `${M}/kandidaten/get` });
      } catch (e) {
        this.showToast(`Geräte nicht geladen: ${e.message ?? e}`);
      }
  }
  bereichName(e) {
    return e && this.kandidaten?.bereiche.find((t) => t.bereich_id === e)?.name || "ohne Bereich";
  }
  async createRoom(e) {
    if (!(!this._hass || !this.kannAendern)) {
      if (this.dirty) {
        this.showToast("Erst den Hausplan speichern oder verwerfen.");
        return;
      }
      this.saving = !0;
      try {
        const t = { type: `${M}/room/create`, name: e.name.trim(), art: e.art };
        e.bereich_id && (t.bereich_id = e.bereich_id), e.art === "melder" ? t.melder = e.melder ?? [] : t.device_id = e.device_id, await this._hass.callWS(t), this.neuRaum = null, this.showToast(`Raum „${e.name.trim()}“ angelegt. Jetzt im Plan an seinen Platz ziehen.`), await this.unsubscribeHaus(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load(), this.viewTouched = !1, this.fit(), await this.loadKandidaten();
      } catch (t) {
        this.showToast(`Nicht angelegt: ${t.message ?? t}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  async deleteRoom() {
    const e = this.raum;
    if (!(!this._hass || !e || !this.kannAendern) && confirm(`Raum „${e.name}“ mit allen Zonen und seinen Anzeigen in Home Assistant löschen? Automationen, die sie benutzen, gehen dann nicht mehr.`)) {
      this.saving = !0;
      try {
        await this._hass.callWS({ type: `${M}/room/delete`, raum_id: e.id }), this.dirty = !1, this.showToast(`Raum „${e.name}“ gelöscht.`), await this.unsubscribeLive(), await new Promise((t) => window.setTimeout(t, 1500)), this.page = "haus", await this.load();
      } catch (t) {
        this.showToast(`Nicht gelöscht: ${t.message ?? t}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  /** Bewegungsprofil: für jeden Raum, wann dort jemand war (aus den Aufnahmen). */
  async loadProfil(e) {
    if (this.profilStunden = e, !e || !this._hass || !this.data || !this.kannAendern) {
      this.profil = void 0;
      return;
    }
    this.profilLaedt = !0;
    const t = {};
    let n = 0, s = 0;
    await Promise.all(
      this.data.raeume.map(async (i) => {
        try {
          const r = await this._hass.callWS({ type: `${M}/auswertung/get`, raum_id: i.id, stunden: e });
          t[i.id] = fn(r.figuren.filter((a) => !a.hund).map((a) => a.abschnitte)), n = r.von, s = r.bis;
        } catch {
        }
      })
    ), e === this.profilStunden && (this.profil = n ? { von: n, bis: s, raeume: t } : void 0, this.profilLaedt = !1);
  }
  async saveHaus() {
    if (!(!this._hass || !this.data || !this.kannAendern)) {
      this.saving = !0;
      try {
        const e = new Map(this.data.raeume.flatMap((n) => V(n)).map((n) => [n.key, n])), t = Object.entries(this.tueren).filter(([n, s]) => e.has(n) && e.get(n).ziel !== s).map(([n, s]) => {
          const i = e.get(n);
          return i.oeffnung !== void 0 ? { raum_id: i.raumId, oeffnung: i.oeffnung, fuehrt_zu: s || null } : { raum_id: i.raumId, zone_id: i.zoneId, fuehrt_zu: s || null };
        });
        await this._hass.callWS({
          type: `${M}/haus/save`,
          raeume: Object.entries(this.lagen).map(([n, s]) => ({ raum_id: n, x: Math.round(s.x), y: Math.round(s.y), winkel: s.winkel })),
          tueren: t
        }), this.dirty = !1, this.showToast("Hausplan gespeichert."), await this.unsubscribeHaus(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load();
      } catch (e) {
        this.showToast(`Nicht gespeichert: ${e.message ?? e}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  showToast(e) {
    this.toast = e, window.clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => this.toast = "", 4e3);
  }
  // -- Lebenszyklus --------------------------------------------------------
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("keydown", this.onKey), this._hass && this.page === "haus" ? this.subscribeHaus() : this._hass && this.raumId && this.subscribeLive(), this._hass && this.tab === "auswertung" && this.openTab("auswertung");
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this.onKey), window.clearInterval(this.heatTimer), window.clearInterval(this.auswTimer), this.resize?.disconnect(), this.resize = void 0, this.unsubscribeLive(), this.unsubscribeHaus();
  }
  updated(e) {
    super.updated(e);
    const t = this.renderRoot.querySelector(".stage");
    t && !this.resize && (this.resize = new ResizeObserver((n) => {
      const s = n[0].contentRect;
      !s.width || !s.height || s.width === this.size.w && s.height === this.size.h || (this.size = { w: s.width, h: s.height }, this.viewTouched || this.fit());
    }), this.resize.observe(t));
  }
  // -- Umrechnung Bildschirm ↔ Raum ----------------------------------------
  toScreen([e, t]) {
    const { cx: n, cy: s, scale: i } = this.view;
    return [this.size.w / 2 + (e - n) * i, this.size.h / 2 - (t - s) * i];
  }
  screenPoints(e) {
    return wn(e.map((t) => this.toScreen(t)));
  }
  toWorld(e) {
    const n = this.renderRoot.querySelector("svg.plan")?.getBoundingClientRect() ?? { left: 0, top: 0 }, { cx: s, cy: i, scale: r } = this.view;
    return [s + (e.clientX - n.left - this.size.w / 2) / r, i - (e.clientY - n.top - this.size.h / 2) / r];
  }
  snapped(e) {
    return Lt(e, vn);
  }
  px(e) {
    return e * this.view.scale;
  }
  zoom(e, t) {
    this.viewTouched = !0;
    const { cx: n, cy: s, scale: i } = this.view, r = Math.max(0.05, Math.min(8, i * e));
    if (!t) {
      this.view = { cx: n, cy: s, scale: r };
      return;
    }
    const a = i / r;
    this.view = { cx: t[0] - (t[0] - n) * a, cy: t[1] - (t[1] - s) * a, scale: r };
  }
  // -- Bearbeiten ------------------------------------------------------------
  remember() {
    this.history.push({ zones: this.zones, sensor: this.sensor, umriss: this.umriss, oeffnungen: this.oeffnungen });
  }
  updateZone(e, t) {
    const n = this.zones.slice();
    n[e] = { ...n[e], ...t }, this.zones = n, this.dirty = !0;
  }
  updateRegel(e, t) {
    this.remember(), this.updateZone(e, { regel: { ...this.zones[e].regel, ...t } });
  }
  setRolle(e, t) {
    if (!this.data) return;
    this.remember();
    const n = this.zones.slice();
    n[e] = en(n[e], t, this.data.vorlagen), this.zones = n, this.dirty = !0;
  }
  addZone(e) {
    this.data && (this.remember(), this.zones = [...this.zones, Gt(e, this.zones, this.data.vorlagen)], this.select(this.zones.length - 1), this.dirty = !0);
  }
  deleteZone(e) {
    if (e < 0) return;
    const t = this.zones[e]?.name ?? "Zone";
    confirm(`Zone „${t}“ löschen? Bis zum Speichern lässt sich das mit „Rückgängig“ zurückholen.`) && (this.remember(), this.zones = this.zones.filter((n, s) => s !== e), this.selected = -1, this.dirty = !0);
  }
  select(e) {
    e !== this.selected && (this.selVertex = -1), this.selected = e, e >= 0 && (this.selOpening = -1), e >= 0 && (this.sensorOpen = !1, this.openTab("zonen"));
  }
  setTool(e) {
    this.tool = e, this.draft = [], this.rectDraft = null, this.layersOpen = !1, e !== "auswahl" && e !== "zellen" && (this.selected = -1);
  }
  // -- Zeiger ------------------------------------------------------------------
  sensorHandle() {
    const [e, t] = ht(this.sensor.winkel), n = 46 / this.view.scale;
    return [this.sensor.x + e * n, this.sensor.y + t * n];
  }
  near(e, t, n = E) {
    return ge(this.toScreen(e), this.toScreen(t)) <= n;
  }
  zoneAt(e) {
    for (let t = this.zones.length - 1; t >= 0; t--) if (Ze(e, this.zones[t].form)) return t;
    return -1;
  }
  onPointerDown(e) {
    if (e.button === 2) return;
    this.layersOpen = !1;
    const t = e.currentTarget, n = this.toWorld(e), s = this.snapped(n);
    if (t.setPointerCapture(e.pointerId), this.page === "haus") {
      const o = this.hausRoomAt(n);
      this.hausSel = o, o && this.kannAendern ? this.drag = { kind: "haus-raum", id: o, last: n } : this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }
    if (!this.kannAendern) {
      const o = this.zoneAt(n);
      this.select(o), o < 0 && (this.sensorOpen = !1, this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } });
      return;
    }
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft.length >= 3 && this.near(n, this.draft[0]) ? this.finishDraft() : this.draft = [...this.draft, s];
      return;
    }
    if (this.tool === "oeffnung") {
      const o = this.wallAt(n, E * 2);
      if (o < 0) {
        this.showToast(this.umriss.length >= 3 ? "Bitte direkt auf einer Wand beginnen." : "Zuerst die Wände zeichnen.");
        return;
      }
      this.drag = { kind: "opening", kante: o, start: n }, this.openingDraft = null;
      return;
    }
    if (this.tool === "rechteck") {
      this.drag = { kind: "rect", start: s }, this.rectDraft = [s, s];
      return;
    }
    if (this.tool === "zellen") {
      let o = this.selected;
      o < 0 || this.zones[o].form.art !== "zellen" ? (this.addZone({ art: "zellen", groesse: Ct, zellen: [] }), o = this.zones.length - 1) : this.remember();
      const l = this.zones[o].form, [h, d] = Me(n, l.groesse, l.x0 ?? 0, l.y0 ?? 0), p = !l.zellen.some(([$, y]) => $ === h && y === d);
      this.drag = { kind: "paint", add: p }, this.updateZone(o, { form: We(l, n, p) });
      return;
    }
    const i = this.zones[this.selected];
    if (i && i.form.art !== "zellen" && this.near(n, this.zoneRotateHandle(i.form))) {
      this.remember();
      const o = S(i.form);
      this.drag = { kind: "rotate-zone", center: o, start: pe(o, n), anchor: i.form };
      return;
    }
    if (i?.form.art === "vieleck") {
      const o = i.form.punkte.findIndex((h) => this.near(n, h));
      if (o >= 0) {
        if (this.remember(), e.altKey) {
          this.deleteVertex(this.selected, o);
          return;
        }
        this.selVertex = o, this.drag = { kind: "vertex", index: o };
        return;
      }
      const l = L(i.form.punkte).findIndex((h) => this.near(n, h));
      if (l >= 0) {
        this.remember(), this.updateZone(this.selected, { form: Ue(i.form, l, this.snapped(L(i.form.punkte)[l])) }), this.selVertex = l + 1, this.drag = { kind: "vertex", index: l + 1 };
        return;
      }
    } else if (i?.form.art === "rechteck") {
      const o = i.form, l = se(o.mitte, o.breite, o.tiefe, o.winkel).findIndex((h) => this.near(n, h));
      if (l >= 0) {
        this.remember(), this.drag = { kind: "corner", index: l };
        return;
      }
    }
    if (this.near(n, this.sensorHandle(), E + 2)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor-rotate" }, this.openSensor();
      return;
    }
    if (this.near(n, [this.sensor.x, this.sensor.y], E + 4)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor" }, this.openSensor();
      return;
    }
    const r = this.zoneAt(n);
    if (r >= 0) {
      this.select(r), this.remember(), this.drag = { kind: "zone", last: s };
      return;
    }
    const a = this.umriss.findIndex((o) => this.near(n, o));
    if (a >= 0) {
      this.remember(), this.drag = { kind: "umriss-vertex", index: a };
      return;
    }
    if (this.umriss.length >= 3) {
      const o = L(this.umriss).findIndex((h) => this.near(n, h));
      if (o >= 0) {
        this.remember();
        const h = this.umriss.slice();
        h.splice(o + 1, 0, this.snapped(L(this.umriss)[o])), this.oeffnungen = Je(this.oeffnungen, { inserted: o }, this.umriss.length), this.umriss = h, this.dirty = !0, this.drag = { kind: "umriss-vertex", index: o + 1 };
        return;
      }
      const l = this.openingAt(n);
      if (l >= 0) {
        this.selected = -1, this.selOpening = l, this.sensorOpen = !1, this.openTab("raum");
        return;
      }
    }
    this.selected = -1, this.selOpening = -1, this.sensorOpen = !1, this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
  }
  deleteVertex(e, t) {
    const n = this.zones[e];
    if (n?.form.art === "vieleck") {
      if (n.form.punkte.length <= 3) {
        this.showToast("Eine Fläche braucht mindestens drei Punkte.");
        return;
      }
      this.remember(), this.updateZone(e, { form: Jt(n.form, t) }), this.selVertex = -1;
    }
  }
  deleteWallCorner(e) {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember(), this.oeffnungen = Je(this.oeffnungen, { removed: e }, this.umriss.length), this.umriss = this.umriss.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0;
  }
  changeOpening(e, t) {
    this.remember(), this.oeffnungen = this.oeffnungen.map((n, s) => s === e ? { ...n, ...t } : n), this.dirty = !0;
  }
  deleteOpening(e) {
    confirm("Diese Öffnung in der Wand löschen?") && (this.remember(), this.oeffnungen = this.oeffnungen.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0);
  }
  turnZone(e, t) {
    const n = this.zones[e];
    !n || n.form.art === "zellen" || (this.remember(), this.updateZone(e, { form: qe(n.form, S(n.form), t) }));
  }
  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  wallAt(e, t = E) {
    const n = this.umriss.length;
    if (n < 3) return -1;
    let s = -1, i = t;
    for (let r = 0; r < n; r++) {
      const a = fe(this.toScreen(e), this.toScreen(this.umriss[r]), this.toScreen(this.umriss[(r + 1) % n]));
      a <= i && (s = r, i = a);
    }
    return s;
  }
  openingAt(e) {
    return this.oeffnungen.findIndex((t) => {
      const [n, s] = Xe(this.umriss, t);
      return fe(this.toScreen(e), this.toScreen(n), this.toScreen(s)) <= E;
    });
  }
  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  zoneRotateHandle(e) {
    const t = S(e), n = Math.max(...F(e).map((s) => s[1]));
    return [t[0], n + 36 / this.view.scale];
  }
  openSensor() {
    this.selected = -1, this.sensorOpen = !0, this.openTab("raum");
  }
  onPointerMove(e) {
    const t = this.toWorld(e), n = this.snapped(t);
    this.hover = n;
    const s = this.drag;
    if (!s) return;
    const i = this.zones[this.selected];
    switch (s.kind) {
      case "pan": {
        this.viewTouched = !0;
        const r = (e.clientX - s.start[0]) / this.view.scale, a = (e.clientY - s.start[1]) / this.view.scale;
        this.view = { ...this.view, cx: s.view.cx - r, cy: s.view.cy + a };
        break;
      }
      case "vertex":
        i && this.updateZone(this.selected, { form: Xt(i.form, s.index, n) });
        break;
      case "corner":
        i?.form.art === "rechteck" && this.updateZone(this.selected, { form: tn(i.form, s.index, n) });
        break;
      case "umriss-vertex": {
        const r = this.umriss.slice();
        r[s.index] = n, this.umriss = r, this.dirty = !0;
        break;
      }
      case "zone": {
        if (!i) break;
        const r = n[0] - s.last[0], a = n[1] - s.last[1];
        if (i.form.art === "zellen") {
          const o = i.form.groesse, l = Math.round(r / o), h = Math.round(a / o);
          if (!l && !h) break;
          this.updateZone(this.selected, { form: $e(i.form, l * o, h * o) }), this.drag = { kind: "zone", last: [s.last[0] + l * o, s.last[1] + h * o] };
        } else (r || a) && (this.updateZone(this.selected, { form: $e(i.form, r, a) }), this.drag = { kind: "zone", last: n });
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: n[0], y: n[1] });
        break;
      case "sensor-rotate": {
        let r = pe([this.sensor.x, this.sensor.y], t);
        e.shiftKey || (r = Math.round(r / 5) * 5), r <= -180 && (r += 360), this.moveSensor({ ...this.sensor, winkel: r });
        break;
      }
      case "paint":
        i?.form.art === "zellen" && this.updateZone(this.selected, { form: We(i.form, t, s.add) });
        break;
      case "rect":
        this.rectDraft = [s.start, n];
        break;
      case "opening": {
        this.openingDraft = rn(this.umriss, s.kante, s.start, t);
        break;
      }
      case "rotate-zone": {
        let r = pe(s.center, t) - s.start;
        e.shiftKey || (r = Math.round(r / 5) * 5), this.updateZone(this.selected, { form: qe(s.anchor, s.center, r) });
        break;
      }
      case "haus-raum": {
        const r = Math.round((t[0] - s.last[0]) / 10) * 10, a = Math.round((t[1] - s.last[1]) / 10) * 10;
        if (!r && !a) break;
        const o = this.lagen[s.id];
        this.lagen = { ...this.lagen, [s.id]: { ...o, x: o.x + r, y: o.y + a } }, this.drag = { ...s, last: [s.last[0] + r, s.last[1] + a] }, this.dirty = !0;
        break;
      }
    }
  }
  moveSensor(e) {
    this.sensor = e;
    const t = this.sensorAnchor;
    this.zonesFollow && t && (this.zones = t.zones.map((n) => ({ ...n, form: Bt(n.form, t.sensor, e) }))), this.dirty = !0;
  }
  onPointerUp() {
    const e = this.drag;
    if (this.drag = null, this.sensorAnchor = null, e?.kind === "opening") {
      const t = this.openingDraft;
      this.openingDraft = null, t ? (this.remember(), this.oeffnungen = [...this.oeffnungen, t], this.selOpening = this.oeffnungen.length - 1, this.selected = -1, this.openTab("raum"), this.dirty = !0, this.tool = "auswahl") : this.showToast("Etwas weiter an der Wand entlang ziehen (mindestens 20 cm).");
      return;
    }
    if (e?.kind === "rect" && this.rectDraft) {
      const [t, n] = this.rectDraft;
      this.rectDraft = null, Math.abs(t[0] - n[0]) >= 10 && Math.abs(t[1] - n[1]) >= 10 && (this.addZone(Be(t, n)), this.tool = "auswahl");
    }
  }
  onDoubleClick(e) {
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft = this.draft.slice(0, -1), this.finishDraft();
      return;
    }
    const t = this.zones[this.selected];
    if (this.tool !== "auswahl" || t?.form.art !== "vieleck") return;
    const n = this.toWorld(e), s = t.form.punkte;
    for (let i = 0; i < s.length; i++)
      if (fe(this.toScreen(n), this.toScreen(s[i]), this.toScreen(s[(i + 1) % s.length])) <= E) {
        this.remember(), this.updateZone(this.selected, { form: Ue(t.form, i, this.snapped(n)) });
        return;
      }
  }
  onWheel(e) {
    e.preventDefault(), this.zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, this.toWorld(e));
  }
  // -- Plan zeichnen -------------------------------------------------------------
  renderGrid() {
    const { w: e, h: t } = this.size, n = this.view.scale, s = this.view.cx - e / 2 / n, i = this.view.cx + e / 2 / n, r = this.view.cy - t / 2 / n, a = this.view.cy + t / 2 / n, o = n > 0.6 ? 50 : n > 0.2 ? 100 : 500, l = [];
    for (let h = Math.floor(s / o) * o; h <= i; h += o) {
      const [d] = this.toScreen([h, 0]);
      l.push(b`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1=${d} y1="0" x2=${d} y2=${t} />`);
    }
    for (let h = Math.floor(r / o) * o; h <= a; h += o) {
      const [, d] = this.toScreen([0, h]);
      l.push(b`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1="0" y1=${d} x2=${e} y2=${d} />`);
    }
    return b`<g>${l}</g>`;
  }
  renderRoom() {
    if (this.umriss.length < 3) return u;
    const e = this.screenPoints(this.umriss), t = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen, n = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen, s = S({ art: "vieleck", punkte: this.umriss }), i = this.istMelder && !!this.live?.zonen[O]?.belegt;
    return b`<polygon class="floor ${i ? "belegt" : ""}" points=${e} />
      <polygon class="wall" points=${e} />
      ${n.map((r, a) => this.renderOpening(r, a === this.selOpening || r === this.openingDraft, s))}
      ${t ? b`${this.umriss.map((r) => {
      const [a, o] = this.toScreen(r);
      return b`<circle class="handle" cx=${a} cy=${o} r="5" />`;
    })}
          ${L(this.umriss).map((r) => this.renderPlus(r))}` : u}`;
  }
  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  renderOpening(e, t, n) {
    const [s, i] = Xe(this.umriss, e), [r, a] = this.toScreen(s), [o, l] = this.toScreen(i), h = b`<line class="wall-gap" x1=${r} y1=${a} x2=${o} y2=${l} />`;
    if (e.art === "offen")
      return b`<g class="opening ${t ? "selected" : ""}">${h}<line class="opening-line" x1=${r} y1=${a} x2=${o} y2=${l} /></g>`;
    const [d, p, $, y] = e.anschlag === "ende" ? [o, l, r, a] : [r, a, o, l], z = Math.hypot($ - d, y - p) || 1;
    let v = -(y - p) / z, x = ($ - d) / z;
    const [w, A] = this.toScreen(n);
    (w - d) * v + (A - p) * x >= 0 !== (e.aufgehen !== "aussen") && (v = -v, x = -x);
    const _ = d + v * z, C = p + x * z, ce = ($ - d) * x - (y - p) * v > 0 ? 0 : 1;
    return b`<g class="opening ${t ? "selected" : ""}">${h}
      <line class="door-leaf" x1=${d} y1=${p} x2=${_} y2=${C} />
      <path class="door-arc" d="M ${_} ${C} A ${z} ${z} 0 0 ${ce} ${$} ${y}" /></g>`;
  }
  /** Kleines „+“: hier einen Punkt einfügen. */
  renderPlus(e) {
    const [t, n] = this.toScreen(e);
    return b`<g class="plus"><circle cx=${t} cy=${n} r="6" /><path d="M ${t - 3} ${n} H ${t + 3} M ${t} ${n - 3} V ${n + 3}" /></g>`;
  }
  /** Zellen, die gerade als Bewegungskarte gezeigt werden. */
  heatQuelle() {
    if (this.istMelder) return null;
    if (this.tab === "auswertung" && this.ausw) {
      const e = this.ausw, t = this.auswFigur ? e.figuren.filter((n) => n.figur === this.auswFigur) : e.figuren;
      return { key: `a|${e.bis}|${e.stunden}|${this.auswFigur}`, zellen: dn(t.map((n) => n.zellen)), zelle: e.zelle_cm, sigma: 8 };
    }
    if (this.heat?.zellen.length) {
      const e = this.heat;
      return { key: `h|${e.minuten}|${e.zellen.length}|${e.zellen.reduce((t, n) => t + n[2], 0)}`, zellen: e.zellen, zelle: e.zelle_cm, sigma: e.zelle_cm * 0.75 };
    }
    return null;
  }
  heatRgb() {
    const e = getComputedStyle(this).getPropertyValue("--rz-heat").split(",").map((t) => Number(t.trim()));
    return e.length === 3 && e.every((t) => Number.isFinite(t)) ? [e[0], e[1], e[2]] : [255, 87, 34];
  }
  renderHeat() {
    const e = this.heatQuelle();
    if (!e || !e.zellen.length) return u;
    let t = this.heatBildCache;
    if (t?.key !== e.key) {
      const i = hn(e.zellen, e.zelle, e.sigma);
      if (!i) return u;
      const r = document.createElement("canvas");
      r.width = i.nx, r.height = i.ny;
      const a = r.getContext("2d");
      if (!a) return u;
      a.putImageData(new ImageData(un(i, this.heatRgb()), i.nx, i.ny), 0, 0), t = { key: e.key, href: r.toDataURL(), x0: i.x0, y0: i.y0, w: i.nx * i.zelle, h: i.ny * i.zelle }, this.heatBildCache = t;
    }
    const [n, s] = this.toScreen([t.x0, t.y0 + t.h]);
    return b`<image class="heat" href=${t.href} x=${n} y=${s} width=${this.px(t.w)} height=${this.px(t.h)} preserveAspectRatio="none" />`;
  }
  /** Melder-Raum: in der Mitte steht, ob jemand da ist. */
  renderMelderLabel() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[O]?.belegt, s = this.umriss.length >= 3 ? S({ art: "vieleck", punkte: this.umriss }) : [0, 0], [i, r] = this.toScreen(s);
    return b`<text class="label room" x=${i} y=${r}>${t ? n ? "jemand da" : "niemand" : "Melder nicht erreichbar"}</text>
      ${this.umriss.length < 3 ? b`<text class="label sub" x=${i} y=${r + 18}>Wände zeichnen: Werkzeug links</text>` : u}`;
  }
  renderCoverage() {
    if (!this.layers.abdeckung) return u;
    const e = this.sensor;
    return b`<polygon class="coverage" points=${this.screenPoints(je([e.x, e.y], e.winkel, e.reichweite_cm, e.oeffnung_grad))} />`;
  }
  renderZone(e, t) {
    const n = (e.id ? this.live?.zonen[e.id]?.belegt : !1) ?? !1, s = B(e), i = K(s), r = t === this.selected, a = n ? 0.5 : 0.2;
    let o;
    if (e.form.art === "zellen")
      o = b`${Ae(e.form).map((l) => {
        const [h, d] = this.toScreen([l.x, l.y + l.s]);
        return b`<rect class="zone-shape ${r ? "selected" : ""}" x=${h} y=${d} width=${this.px(l.s)} height=${this.px(l.s)} fill=${i} fill-opacity=${a} stroke=${i} style="stroke-width:1" />`;
      })}`;
    else {
      const l = this.screenPoints(F(e.form)), h = r && e.regel.rand_cm > 0 ? this.px(e.regel.rand_cm * 2) : 0;
      o = b`
        ${h ? b`<mask id="rz-band-${t}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${l} fill="black" />
              </mask>
              <polygon points=${l} fill="none" stroke=${i} stroke-opacity="0.25" stroke-width=${h} stroke-linejoin="round" mask="url(#rz-band-${t})" />` : u}
        <polygon class="zone-shape ${r ? "selected" : ""}" points=${l} fill=${i} fill-opacity=${a} stroke=${i} />`;
    }
    return b`<g>${o}</g>`;
  }
  /** Beschriftung der Zone; wird nach den Figuren gezeichnet, damit sie lesbar bleibt. */
  renderZoneLabel(e) {
    const t = e.id ? this.live?.zonen[e.id] : void 0, [n, s] = this.toScreen(S(e.form)), i = t ? t.belegt ? `belegt${t.personen > 1 ? ` · ${t.personen}` : ""}` : "frei" : "neu";
    return b`<text class="label" x=${n} y=${s - 2}>${e.name}</text>
      <text class="label sub" x=${n} y=${s + 14}>${i}</text>`;
  }
  renderHandles() {
    const e = this.zones[this.selected];
    if (!e || this.tool !== "auswahl" || !this.kannAendern) return u;
    let t = [];
    e.form.art === "vieleck" ? t = e.form.punkte : e.form.art === "rechteck" && (t = se(e.form.mitte, e.form.breite, e.form.tiefe, e.form.winkel));
    let n = u;
    if (e.form.art !== "zellen") {
      const [s, i] = this.toScreen(S(e.form)), [r, a] = this.toScreen(this.zoneRotateHandle(e.form));
      n = b`<line class="sensor-line" x1=${s} y1=${i} x2=${r} y2=${a} /><circle class="handle angle" cx=${r} cy=${a} r="8"><title>Drehen</title></circle>`;
    }
    return b`${n}
      ${e.form.art === "vieleck" ? L(e.form.punkte).map((s) => this.renderPlus(s)) : u}
      ${t.map((s, i) => {
      const [r, a] = this.toScreen(s), o = e.form.art === "vieleck" && i === this.selVertex;
      return b`<rect class="handle ${o ? "on" : ""}" x=${r - 5} y=${a - 5} width="10" height="10" rx="2" />`;
    })}`;
  }
  renderSensor() {
    const e = this.sensor, [t, n] = this.toScreen([e.x, e.y]), [s, i] = this.toScreen(this.sensorHandle()), r = -e.winkel * Math.PI / 180, a = [4.5, 7.5].map((o) => {
      const l = r - Math.PI / 2 - 0.7, h = r - Math.PI / 2 + 0.7;
      return b`<path class="sensor-wave" d="M ${t + o * Math.cos(l)} ${n + o * Math.sin(l)} A ${o} ${o} 0 0 1 ${t + o * Math.cos(h)} ${n + o * Math.sin(h)}" />`;
    });
    return b`<g>
      ${this.kannAendern ? b`<line class="sensor-line" x1=${t} y1=${n} x2=${s} y2=${i} />
            <circle class="handle angle" cx=${s} cy=${i} r="8" />` : u}
      <circle class="sensor-body" cx=${t} cy=${n} r="12" />
      ${a}
    </g>`;
  }
  renderLive() {
    const e = this.live;
    if (!e) return u;
    const t = [];
    if (this.layers.ziele)
      for (const [, n, s] of e.ziele) {
        const [i, r] = this.toScreen([n, s]);
        t.push(b`<path class="target" d="M${i - 4} ${r - 4} L${i + 4} ${r + 4} M${i - 4} ${r + 4} L${i + 4} ${r - 4}" />`);
      }
    for (const n of e.figuren) {
      if (n.tags.includes("wiederhergestellt") || n.tags.includes("stoerung")) continue;
      const s = n.tags.includes("hund") || n.art === "pet", i = s ? "var(--rz-tier)" : "var(--rz-person)";
      if (this.layers.spuren && n.spur.length > 1 && t.push(b`<polyline class="trail" points=${this.screenPoints(n.spur)} stroke=${i} />`), !this.layers.figuren) continue;
      const [r, a] = this.toScreen([n.x, n.y]), o = Math.max(7, this.px(14));
      t.push(b`<circle class="figure ${n.gehalten ? "held" : ""}" cx=${r} cy=${a} r=${o} fill=${i} stroke=${n.gehalten ? i : "var(--card)"} />`), (s || n.gehalten) && t.push(b`<text class="label sub" x=${r} y=${a - o - 5}>${s ? "Hund?" : "gehalten"}</text>`);
    }
    return b`<g>${t}</g>`;
  }
  renderDraft() {
    if (this.rectDraft) {
      const s = Be(...this.rectDraft);
      if (s.art !== "rechteck") return u;
      const [i, r] = this.toScreen(s.mitte);
      return b`<polygon class="draft" points=${this.screenPoints(se(s.mitte, s.breite, s.tiefe, 0))} />
        <text class="label" x=${i} y=${r + 5}>${(s.breite / 100).toFixed(2)} × ${(s.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return u;
    const e = this.hover ? [...this.draft, this.hover] : this.draft, [t, n] = this.toScreen(this.draft[0]);
    return b`<polyline class="draft" points=${this.screenPoints(e)} style="fill:none" />
      ${this.draft.map((s) => {
      const [i, r] = this.toScreen(s);
      return b`<circle class="draft-dot" cx=${i} cy=${r} r="4" />`;
    })}
      ${this.draft.length >= 3 ? b`<circle class="close-ring" cx=${t} cy=${n} r=${E} />` : u}`;
  }
  hausRoomAt(e) {
    const t = this.data?.raeume ?? [];
    for (let n = t.length - 1; n >= 0; n--) {
      const s = t[n], i = this.lagen[s.id];
      if (i && Ze(e, { art: "vieleck", punkte: this.outlineOf(s).map((r) => R(r, i)) })) return s.id;
    }
    return "";
  }
  /** Mitte einer Tür im Haus. */
  renderHausPlan() {
    const e = this.data?.raeume ?? [], t = [], n = [], s = [], i = [];
    for (const r of e) {
      const a = this.lagen[r.id];
      if (!a) continue;
      const o = this.outlineOf(r).map((v) => R(v, a)), l = r.id === this.hausSel, h = this.hausLive[r.id], d = r.art === "melder" && !!h?.zonen[O]?.belegt;
      t.push(b`<polygon class="floor ${d ? "belegt" : ""}" points=${this.screenPoints(o)} />
        <polygon class="wall ${r.umriss.length >= 3 ? "" : "guess"} ${l ? "selected" : ""}" points=${this.screenPoints(o)} />`);
      for (const v of r.zonen) {
        const x = B(v);
        if (x === "ignorieren") continue;
        const w = (v.id ? h?.zonen[v.id]?.belegt : !1) ?? !1, A = F(v.form).map((k) => R(k, a));
        t.push(b`<polygon class="zone-shape" points=${this.screenPoints(A)} fill=${K(x)} fill-opacity=${w ? 0.5 : 0.18} stroke=${K(x)} />`);
      }
      for (const v of V(r)) {
        const x = this.tueren[v.key] ?? "", [w, A] = this.toScreen(R(v.punkt, a));
        if (x === "aussen")
          s.push(b`<text class="label sub" x=${w} y=${A - 10}>nach draußen</text>`);
        else if (x) {
          const k = e.find((ue) => ue.id === x);
          if (!k) continue;
          const _ = V(k).find((ue) => this.tueren[ue.key] === r.id);
          if (_ && r.id > k.id) continue;
          const C = this.lagen[k.id];
          if (!C) continue;
          const ce = R(_ ? _.punkt : S({ art: "vieleck", punkte: this.outlineOf(k) }), C), [Se, Re] = this.toScreen(ce);
          n.push(b`<line class="link" x1=${w} y1=${A} x2=${Se} y2=${Re} />
            <circle class="link-dot" cx=${w} cy=${A} r="5" /><circle class="link-dot" cx=${Se} cy=${Re} r="5" />`);
        }
      }
      const [p, $] = this.toScreen(S({ art: "vieleck", punkte: o })), y = h ? h.figuren.filter((v) => !v.tags.includes("wiederhergestellt") && !v.tags.includes("stoerung")).length : 0, z = !h || h.problem || !h.verfuegbar ? "nicht erreichbar" : r.art === "melder" ? d ? "jemand da" : "niemand" : y ? `${y} ${y === 1 ? "Person" : "Personen"}` : "niemand";
      if (s.push(b`<text class="label room" x=${p} y=${$}>${r.name}</text>
        <text class="label sub" x=${p} y=${$ + 16}>${z}</text>`), r.art !== "melder")
        for (const v of h?.figuren ?? []) {
          if (v.tags.includes("wiederhergestellt") || v.tags.includes("stoerung")) continue;
          const w = v.tags.includes("hund") || v.art === "pet" ? "var(--rz-tier)" : "var(--rz-person)", [A, k] = this.toScreen(R([v.x, v.y], a)), _ = Math.max(6, this.px(14));
          i.push(b`<circle class="figure ${v.gehalten ? "held" : ""}" cx=${A} cy=${k} r=${_} fill=${w} stroke=${v.gehalten ? w : "var(--card)"} />`);
        }
    }
    return b`${t}${n}${i}${s}`;
  }
  renderScalebar() {
    const e = kn(90 / this.view.scale), t = e >= 100 ? `${e / 100} m` : `${e} cm`;
    return c`<div class="scalebar"><div style="width:${this.px(e)}px"></div>${t}</div>`;
  }
  renderBubble() {
    const e = yn[this.tool];
    if (e) {
      const t = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return c`<div class="bubble">
        <ha-icon icon=${et.find((n) => n.tool === this.tool).icon}></ha-icon>
        <span class="grow">${e}</span>
        ${t ? c`<button class="text" @click=${this.finishDraft}>Fertig</button>` : u}
        <button class="text" @click=${() => this.setTool("auswahl")}>${this.tool === "zellen" ? "Fertig" : "Abbrechen"}</button>
      </div>`;
    }
    return this.kannAendern ? this.istMelder ? this.umriss.length >= 3 || this.tool !== "auswahl" ? u : c`<div class="bubble">
        <ha-icon icon="mdi:wall"></ha-icon>
        <span class="grow">Links mit <b>Wände zeichnen</b> den Umriss des Raums einzeichnen, dann Türen in die Wände. So passt er in den Hausplan.</span>
      </div>` : !this.zones.length && this.tool === "auswahl" ? c`<div class="bubble">
        <ha-icon icon="mdi:gesture-tap"></ha-icon>
        <span class="grow">Zuerst den <b>Sensor</b> an seinen Platz ziehen und am gelben Griff drehen. Dann links ein Werkzeug wählen und die erste Zone zeichnen.</span>
      </div>` : u : u;
  }
  renderLayers() {
    if (!this.layersOpen) return u;
    const e = (n, s) => c`<label class="check"
        ><input
          type="checkbox"
          .checked=${this.layers[n]}
          @change=${(i) => this.layers = { ...this.layers, [n]: i.target.checked }}
        /><span>${s}</span></label
      >`, t = (n, s) => c`<button
        class=${this.heatMin === n ? "active" : ""}
        @click=${() => {
      this.heatMin = n, this.loadHeat();
    }}
      >
        ${s}
      </button>`;
    return c`<div class="layers" @pointerdown=${(n) => n.stopPropagation()}>
      ${e("figuren", "Figuren live")} ${e("spuren", "Spuren der letzten Sekunden")}
      ${e("abdeckung", "Abdeckung des Sensors")} ${e("ziele", "Rohpunkte des Sensors")}
      <div class="label-text">Bewegungskarte: wo war jemand?</div>
      <div class="levels">${t(0, "aus")}${t(15, "15 min")}${t(60, "1 h")}${t(1440, "24 h")}</div>
      <p class="hint small">Zählt seit dem letzten Neustart von Home Assistant.${this.kannAendern ? " Länger zurück und feiner: Reiter „Auswertung“." : ""}</p>
    </div>`;
  }
  renderStage() {
    const e = this.tool === "zellen" ? "painting" : this.tool === "auswahl" ? "" : "drawing";
    return c`<div class="stage">
      <svg
        class="plan ${e}"
        viewBox="0 0 ${this.size.w} ${this.size.h}"
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerUp}
        @dblclick=${this.onDoubleClick}
        @wheel=${this.onWheel}
        @contextmenu=${this.onContextMenu}
      >
        ${this.renderGrid()}
        ${this.page === "haus" ? this.renderHausPlan() : this.istMelder ? b`${this.renderRoom()} ${this.renderMelderLabel()} ${this.renderDraft()}` : b`${this.renderRoom()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((t, n) => this.renderZone(t, n))} ${this.renderLive()}
              ${this.zones.map((t) => this.renderZoneLabel(t))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(t) => t.stopPropagation()}>
        ${this.kannAendern && this.page === "raum" ? c`${et.filter((t) => !this.istMelder || xn.includes(t.tool)).map(
      (t) => c`<button class="icon ${this.tool === t.tool ? "on" : ""}" title=${t.label} aria-label=${t.label} @click=${() => this.setTool(t.tool)}>
                  <ha-icon icon=${t.icon}></ha-icon>
                </button>`
    )}
              <span class="sep"></span>` : u}
        ${this.page === "raum" && !this.istMelder ? c`<button class="icon ${this.layersOpen ? "on" : ""}" title="Ebenen und Bewegungskarte" aria-label="Ebenen" @click=${() => this.layersOpen = !this.layersOpen}>
                <ha-icon icon="mdi:layers-outline"></ha-icon>
              </button>
              <span class="sep"></span>` : u}
        <button class="icon" title="Vergrößern" aria-label="Vergrößern" @click=${() => this.zoom(1.25)}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="icon" title="Verkleinern" aria-label="Verkleinern" @click=${() => this.zoom(0.8)}><ha-icon icon="mdi:minus"></ha-icon></button>
        <button
          class="icon"
          title="Einpassen"
          aria-label="Einpassen"
          @click=${() => {
      this.viewTouched = !1, this.fit();
    }}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
      </div>
      ${this.page === "raum" ? c`${this.renderLayers()} ${this.renderBubble()}` : u} ${this.renderScalebar()}
    </div>`;
  }
  // -- Seitenleiste ------------------------------------------------------------
  renderZoneItem(e, t) {
    const n = t === this.selected, s = B(e), i = ie(s), r = e.id ? this.live?.zonen[e.id] : void 0, a = r ? c`<span class="badge ${r.belegt ? "on" : "off"}">${r.belegt ? r.personen > 1 ? `belegt · ${r.personen}` : "belegt" : "frei"}</span>` : c`<span class="badge new">neu</span>`;
    return c`<li class="item ${n ? "open" : ""}" style="--zone:${K(s)}">
      <div class="row" @click=${() => this.select(n ? -1 : t)}>
        <span class="dot"></span>
        <ha-icon icon=${i.icon}></ha-icon>
        <span class="name">${e.name}</span>
        ${a}
      </div>
      ${n ? this.renderInspector(e, t) : u}
    </li>`;
  }
  renderInspector(e, t) {
    const n = e.regel, s = B(e), i = this.data.grenzen, r = (h, d, p, $, y) => c`<label class="field"
        >${d}<input
          type="number"
          min="0"
          max=${$}
          step=${y}
          .value=${String(n[h])}
          @change=${(z) => {
      const v = Number(z.target.value);
      Number.isFinite(v) && this.updateRegel(t, { [h]: Math.max(0, Math.min($, v)) });
    }}
        /><span class="unit">${p}</span></label
      >`, a = (h, d, p, $) => c`<label class="check"
        ><input type="checkbox" .checked=${p} @change=${(y) => $(y.target.checked)} /><span
          >${h}<small>${d}</small></span
        ></label
      >`, o = be(e.form), l = (this.data?.raeume ?? []).filter((h) => h.id !== this.raumId);
    return this.kannAendern ? c`<div class="inspector">
      <label class="field"
        >Name<input
          type="text"
          .value=${e.name}
          @change=${(h) => {
      this.remember(), this.updateZone(t, { name: h.target.value });
    }}
      /></label>
      <div class="label-text">Wofür ist die Zone?</div>
      <div class="levels">
        ${ve.map(
      (h) => c`<button class=${h.rolle === s ? "active" : ""} @click=${() => this.setRolle(t, h.rolle)}>
            <ha-icon icon=${h.icon}></ha-icon>${h.name}
          </button>`
    )}
      </div>
      <p class="hint small">${ie(s).text}</p>
      ${s === "tuer" ? c`<label class="field"
              >Wohin führt die Tür?<select
                @change=${(h) => {
      this.remember(), this.updateZone(t, { fuehrt_zu: h.target.value });
    }}
              >
                <option value="" ?selected=${!e.fuehrt_zu}>weiß nicht</option>
                <option value="aussen" ?selected=${e.fuehrt_zu === "aussen"}>nach draußen / Raum ohne Sensor</option>
                ${l.map((h) => c`<option value=${h.id} ?selected=${e.fuehrt_zu === h.id}>${h.name}</option>`)}
              </select></label
            >
            <p class="hint small">Damit weiß Raumzonen später, wer von wo nach wo geht.</p>` : u}
      ${s === "bett" ? c`${a(
      "Nur eine Person im Bett",
      "Dann wird ein starrer Punkt, den der Sensor beim Aufstehen zurücklässt, verworfen.",
      n.max_personen === 1,
      (h) => this.updateRegel(t, { max_personen: h ? 1 : 0 })
    )}
          ${a(
      "Hund nicht mitzählen",
      "Nur ein Hinweis; ob es der Hund ist, ergibt sich aus Hundeplätzen oder der Art, die der Sensor meldet.",
      n.hund_ignorieren,
      (h) => this.updateRegel(t, { hund_ignorieren: h })
    )}` : u}
      ${s !== "ignorieren" ? c`<div class="summary">${Ke(e)}</div>
            <details class="fine">
              <summary>Feineinstellung</summary>
              <div class="fields">
                ${r("belegt_nach_s", "Belegt nach", "s", i.belegt_nach_s, 0.5)} ${r("frei_nach_s", "Frei nach", "s", i.frei_nach_s, 0.5)}
              </div>
              ${r("rand_cm", "Randstreifen (gegen Zittern am Rand)", "cm", i.rand_cm, 5)}
              ${n.schlaefer_halten ? c`<p class="hint small">Als „aufgestanden“ gilt erst, wer sich draußen bewegt, weit genug weg ist oder zur Tür geht:</p>
                    <div class="fields">
                      ${r("weg_rahmen", "Bewegte Meldungen", "", i.weg_rahmen, 1)} ${r("weg_cm", "oder Abstand", "cm", i.weg_cm, 5)}
                    </div>` : u}
            </details>` : u}
      ${e.form.art !== "zellen" ? c`<div class="label-text">Form</div>
            <div class="actions">
              <button class="text small" title="Gegen den Uhrzeigersinn" @click=${() => this.turnZone(t, 15)}><ha-icon icon="mdi:rotate-left"></ha-icon>15°</button>
              <button class="text small" title="Im Uhrzeigersinn" @click=${() => this.turnZone(t, -15)}><ha-icon icon="mdi:rotate-right"></ha-icon>15°</button>
              ${e.form.art === "vieleck" ? c`<button class="text small" ?disabled=${this.selVertex < 0 || e.form.punkte.length <= 3} @click=${() => this.deleteVertex(t, this.selVertex)}>
                    <ha-icon icon="mdi:vector-point-minus"></ha-icon>Punkt löschen
                  </button>` : u}
            </div>
            <p class="hint small">
              Am gelben Griff drehen. ${e.form.art === "vieleck" ? "Das „+“ auf einer Kante fügt einen Punkt ein; Rechtsklick auf einen Punkt löscht ihn." : ""}
            </p>` : u}
      ${o ? c`<div class="note warn">${o}</div>` : u}
      <div class="actions">
        <span class="spacer"></span>
        <button class="text danger" @click=${() => this.deleteZone(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
      </div>
    </div>` : c`<div class="inspector">
        <p class="hint small">${ie(s).text}</p>
        ${s === "tuer" ? c`<div class="summary">Führt ${nn(e, l)}.</div>` : u}
        ${s !== "ignorieren" ? c`<div class="summary">${Ke(e)}</div>` : u}
      </div>`;
  }
  renderZonesTab() {
    return c`
      ${this.zones.length ? c`<ul class="list">
            ${this.zones.map((e, t) => this.renderZoneItem(e, t))}
          </ul>` : c`<p class="hint">${this.kannAendern ? "Noch keine Zonen. Mit den Werkzeugen links am Plan zeichnen, z. B. ein Rechteck über das Bett." : "Noch keine Zonen eingezeichnet."}</p>`}
      ${this.kannAendern ? this.renderNewZone() : u}`;
  }
  renderNewZone() {
    return c`<h3>Neue Zone</h3>
      <div class="actions">
        <button class="text small" @click=${() => this.setTool("rechteck")}><ha-icon icon="mdi:rectangle-outline"></ha-icon>Rechteck</button>
        <button class="text small" @click=${() => this.setTool("vieleck")}><ha-icon icon="mdi:vector-polygon"></ha-icon>Vieleck</button>
        <button class="text small" @click=${() => this.setTool("zellen")}><ha-icon icon="mdi:grid"></ha-icon>Zellen</button>
      </div>
      <div class="actions">
        <button class="text small" @click=${this.importConverter}><ha-icon icon="mdi:import"></ha-icon>Aus dem Konverter übernehmen</button>
      </div>`;
  }
  renderMelderTab() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[O]?.belegt, s = this.kandidaten, i = (a) => s?.melder.find((o) => o.id === a || o.entity_id === a)?.name ?? a, r = (s?.melder ?? []).filter((a) => !a.benutzt_von || a.benutzt_von === this.raumId || this.melder.includes(a.id));
    return c`<h3>Melder</h3>
      <ul class="list">
        <li class="item">
          <div class="row static">
            <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
            <span class="name">${this.raum?.name}<small>${t ? n ? "jemand da" : "niemand da" : e?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${t ? n ? "on" : "off" : "off unreachable"}" style="--zone:var(--rz-bereich)">${t ? n ? "da" : "leer" : "nicht erreichbar"}</span>
          </div>
        </li>
      </ul>
      ${this.kannAendern ? c`${s ? c`<ul class="melder-liste">
                  ${r.map((a) => {
      const o = this.melder.includes(a.id) || this.melder.includes(a.entity_id);
      return c`<li>
                      <label class="check"
                        ><input
                          type="checkbox"
                          .checked=${o}
                          @change=${(l) => {
        const h = l.target.checked;
        this.melder = h ? [...this.melder, a.id] : this.melder.filter((d) => d !== a.id && d !== a.entity_id), this.dirty = !0;
      }}
                        /><span>${a.name}<small>${this.bereichName(a.bereich_id)}</small></span></label
                      >
                    </li>`;
    })}
                </ul>` : c`<p class="hint">Lädt …</p>`}
            <label class="field"
              >Nachlauf<input
                type="number"
                min="0"
                max=${this.data?.grenzen.melder_nachlauf_s ?? 3600}
                .value=${String(this.nachlauf)}
                @change=${(a) => {
      const o = Number(a.target.value);
      Number.isFinite(o) && (this.nachlauf = Math.max(0, Math.min(this.data?.grenzen.melder_nachlauf_s ?? 3600, Math.round(o))), this.dirty = !0);
    }}
              /><span class="unit">s</span></label
            >
            <div class="summary">
              Der Raum gilt als belegt, solange ein Melder „Bewegung“ meldet, und noch ${10 + this.nachlauf} s danach${this.nachlauf ? ` (10 s Haltezeit und ${this.nachlauf} s Nachlauf)` : " (Haltezeit)"}. Sind alle Melder nicht erreichbar, bleibt der letzte Stand.
            </div>` : c`<ul class="doors">
            ${this.melder.map((a) => c`<li class="door"><ha-icon icon="mdi:motion-sensor"></ha-icon><span>${i(a)}</span></li>`)}
          </ul>`}
      ${this.kannAendern ? this.renderRoomEdit() : u}`;
  }
  renderRoomTab() {
    if (this.istMelder) return this.renderMelderTab();
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = e?.letzter_rahmen_vor_s, s = e ? e.figuren.filter((r) => !r.tags.includes("wiederhergestellt") && !r.tags.includes("stoerung")).length : 0, i = (r, a, o, l, h) => c`<label class="field"
        >${a}<input
          type="number"
          min=${l}
          max=${h}
          .value=${String(this.sensor[r])}
          @change=${(d) => {
      const p = Number(d.target.value);
      Number.isFinite(p) && (this.remember(), this.sensor = { ...this.sensor, [r]: Math.max(l, Math.min(h, p)) }, this.dirty = !0);
    }}
        /><span class="unit">${o}</span></label
      >`;
    return c`<h3>Sensor</h3>
      <ul class="list">
        <li class="item ${this.sensorOpen ? "open" : ""}">
          <div class="row" @click=${() => this.sensorOpen = !this.sensorOpen}>
            <span class="marker-icon"><ha-icon icon="mdi:radar"></ha-icon></span>
            <span class="name">Radarsensor<small>${t ? "liefert Daten" : e?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${t ? "on" : "off"}" style="--zone:var(--ok)">${t ? "live" : "nicht erreichbar"}</span>
          </div>
          ${this.sensorOpen ? c`<div class="inspector">
                <dl>
                  <dt>Figuren</dt>
                  <dd>${s}</dd>
                  <dt>Letzte Meldung</dt>
                  <dd>${n == null ? "–" : n < 120 ? `vor ${Math.round(n)} s` : `vor ${Math.round(n / 60)} min`}</dd>
                </dl>
                <p class="hint small">Liegt jemand ruhig, meldet der Sensor oft minutenlang nichts. Das ist normal; Raumzonen hält die Figur.</p>
                ${this.kannAendern ? this.renderSensorEdit(i) : u}
              </div>` : u}
        </li>
      </ul>
      ${this.kannAendern ? this.renderRoomEdit() : u}`;
  }
  renderSensorEdit(e) {
    return c`<label class="check"
                  ><input type="checkbox" .checked=${this.zonesFollow} @change=${(t) => this.zonesFollow = t.target.checked} /><span
                    >Zonen bewegen sich mit dem Sensor<small
                      >Praktisch beim Ausrichten: Zonen aus dem Konverter hängen am Sensor. Ausschalten, wenn die Zonen schon zum Raum passen und
                      nur der Sensor versetzt wird.</small
                    ></span
                  ></label
                >
                <details class="fine">
                  <summary>Abdeckung</summary>
                  <div class="fields">${e("reichweite_cm", "Reichweite", "cm", 50, 1500)} ${e("oeffnung_grad", "Öffnung", "°", 10, 360)}</div>
                  <p class="hint small">Laut Datenblatt des eigenen Geräts. Die Bewegungskarte zeigt, wo er wirklich sieht.</p>
                </details>`;
  }
  renderRoomEdit() {
    return c`${this.istMelder ? u : c`<p class="hint small">
            So richtest du den Sensor ein: Den dunklen Punkt im Plan an die Stelle ziehen, an der er hängt, und am gelben Griff
            drehen, bis die Abdeckung in den Raum zeigt. Am besten mit eingeschalteter Bewegungskarte einmal durch den Raum gehen.
          </p>`}
      <h3>Wände</h3>
      <p class="hint small">
        Der Umriss des Raums dient zur Orientierung. Ecken ziehen; das „+“ in der Mitte einer Wand fügt eine Ecke ein, Rechtsklick
        auf eine Ecke löscht sie.
      </p>
      <div class="actions">
        <button class="text small" @click=${() => this.setTool("umriss")}><ha-icon icon="mdi:wall"></ha-icon>${this.umriss.length ? "Neu zeichnen" : "Wände zeichnen"}</button>
        ${this.umriss.length >= 3 ? c`<button class="text small" @click=${() => this.setTool("oeffnung")}><ha-icon icon="mdi:door"></ha-icon>Tür / Öffnung</button>` : u}
        ${this.umriss.length ? c`<button
              class="text small danger"
              @click=${() => {
      this.remember(), this.umriss = [], this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
    }}
            >
              Entfernen
            </button>` : u}
      </div>
      ${this.oeffnungen.length ? c`<ul class="list">
            ${this.oeffnungen.map(
      (e, t) => c`<li class="item ${t === this.selOpening ? "open" : ""}">
                <div class="row" @click=${() => this.selOpening = t === this.selOpening ? -1 : t}>
                  <ha-icon icon=${e.art === "tuer" ? "mdi:door" : "mdi:door-open"}></ha-icon>
                  <span class="name">${e.art === "tuer" ? "Tür" : "Offen"}<small>${Math.round(e.bis - e.von)} cm breit</small></span>
                </div>
                ${t === this.selOpening ? c`<div class="inspector">
                      <div class="levels">
                        ${["tuer", "offen"].map(
        (n) => c`<button
                            class=${e.art === n ? "active" : ""}
                            @click=${() => {
          this.remember(), this.oeffnungen = this.oeffnungen.map((s, i) => i === t ? { ...s, art: n } : s), this.dirty = !0;
        }}
                          >
                            ${n === "tuer" ? "Tür" : "Offen (ohne Tür)"}
                          </button>`
      )}
                      </div>
                      ${e.art === "tuer" ? c`<div class="actions">
                            <button
                              class="text small"
                              @click=${() => this.changeOpening(t, { anschlag: e.anschlag === "ende" ? "anfang" : "ende" })}
                            >
                              <ha-icon icon="mdi:swap-horizontal"></ha-icon>Anschlag wechseln
                            </button>
                            <button
                              class="text small"
                              @click=${() => this.changeOpening(t, { aufgehen: e.aufgehen === "aussen" ? "innen" : "aussen" })}
                            >
                              <ha-icon icon="mdi:swap-vertical"></ha-icon>${e.aufgehen === "aussen" ? "Nach innen aufgehen" : "Nach außen aufgehen"}
                            </button>
                          </div>` : u}
                      <p class="hint small">
                        Wohin sie führt, stellst du im Hausplan ein.${this.istMelder ? "" : " Damit Raumzonen „betreten“ und „verlassen“ genau erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor zeichnen."}
                      </p>
                      <div class="actions">
                        <span class="spacer"></span>
                        <button class="text danger" @click=${() => this.deleteOpening(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
                      </div>
                    </div>` : u}
              </li>`
    )}
          </ul>` : u}
      <h3>Aufnahme</h3>
      <label class="check"
        ><input
          type="checkbox"
          .checked=${this.aufnahme}
          @change=${(e) => {
      this.aufnahme = e.target.checked, this.dirty = !0;
    }}
        /><span
          >Bewegungen aufzeichnen<small
            >${this.istMelder ? "Speichert, wann die Melder Bewegung melden," : "Speichert die Punkte des Sensors"} lokal in Home Assistant (nicht im Recorder), damit
            Raumzonen Gewohnheiten lernen und Regeln geprüft werden können. Nur Admins können sie abrufen.</small
          ></span
        ></label
      >
      ${this.aufnahme ? c`<label class="field"
            >Aufbewahren<input
              type="number"
              min="1"
              max=${this.data?.grenzen.aufnahme_tage ?? 365}
              .value=${String(this.aufnahmeTage)}
              @change=${(e) => {
      const t = Math.round(Number(e.target.value));
      Number.isFinite(t) && (this.aufnahmeTage = Math.max(1, Math.min(this.data?.grenzen.aufnahme_tage ?? 365, t)), this.dirty = !0);
    }}
            /><span class="unit">Tage</span></label
          >` : u}
      <h3>Raum löschen</h3>
      <div class="actions">
        <button class="text danger" ?disabled=${this.saving} @click=${this.deleteRoom}><ha-icon icon="mdi:delete-outline"></ha-icon>Raum löschen</button>
      </div>`;
  }
  renderHausSide() {
    const e = this.data?.raeume ?? [], t = e.find((i) => i.id === this.hausSel), n = (i, r, a) => c`<button class="text small" @click=${() => this.turnRoom(t.id, i)}><ha-icon icon=${r}></ha-icon>${a}</button>`, s = (i, r) => {
      const a = r.key, o = this.tueren[a] ?? "", l = e.filter((h) => h.id !== i.id);
      if (!this.kannAendern) {
        const h = o === "aussen" ? "nach draußen" : o ? l.find((d) => d.id === o)?.name ?? "weiß nicht" : "weiß nicht";
        return c`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${r.name}: ${h}</span></li>`;
      }
      return c`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <label class="field"
          >${r.name} führt zu<select
            @change=${(h) => {
        this.tueren = { ...this.tueren, [a]: h.target.value }, this.dirty = !0;
      }}
          >
            <option value="" ?selected=${!o}>weiß nicht</option>
            <option value="aussen" ?selected=${o === "aussen"}>draußen / Raum ohne Raumzonen</option>
            ${l.map((h) => c`<option value=${h.id} ?selected=${o === h.id}>${h.name}</option>`)}
          </select></label
        >
      </li>`;
    };
    return c`<aside class="side">
      <div class="side-body">
        <h3>Hausplan</h3>
        <p class="hint small">
          ${this.kannAendern ? "Räume am Plan an ihren Platz ziehen und hier drehen. Bei jeder Tür eintragen, wohin sie führt; dann sieht Raumzonen, wer von wo nach wo geht." : "So liegen die Räume im Haus. Die Punkte zeigen, wo gerade jemand ist."}
        </p>
        ${this.kannAendern ? this.renderNeuRaum() : u}
        <ul class="list">
          ${e.map((i) => {
      const r = this.hausLive[i.id], a = r ? r.figuren.filter(($) => !$.tags.includes("wiederhergestellt") && !$.tags.includes("stoerung")).length : 0, o = i.id === this.hausSel, l = V(i), h = i.art === "melder", d = h ? !!r?.zonen[O]?.belegt : a > 0, p = !!r && r.verfuegbar && !r.problem;
      return c`<li class="item ${o ? "open" : ""}">
              <div class="row" @click=${() => this.hausSel = o ? "" : i.id}>
                <span class="marker-icon"><ha-icon icon=${h ? "mdi:motion-sensor" : "mdi:radar"}></ha-icon></span>
                <span class="name">${i.name}<small>${h ? "Bewegungsmelder" : "Radarsensor"}${i.haus_gesetzt || this.dirty ? "" : " · noch nicht eingeordnet"}</small></span>
                <span class="badge ${p ? d ? "on" : "off" : "off unreachable"}">${p ? h ? d ? "da" : "leer" : a ? `${a}` : "leer" : "nicht erreichbar"}</span>
              </div>
              ${o ? c`<div class="inspector">
                    ${this.kannAendern && t ? c`<div class="label-text">Drehen</div>
                          <div class="actions">
                            ${n(90, "mdi:rotate-left", "90°")} ${n(-90, "mdi:rotate-right", "90°")} ${n(5, "mdi:rotate-left", "5°")}
                            ${n(-5, "mdi:rotate-right", "5°")}
                          </div>` : u}
                    ${l.length ? c`<div class="label-text">Türen</div>
                          <ul class="doors">
                            ${l.map(($) => s(i, $))}
                          </ul>` : c`<p class="hint small">Keine Tür eingezeichnet. Im Raum mit dem Werkzeug „Tür oder Öffnung“ in eine Wand zeichnen${h ? "" : " oder eine Zone mit der Rolle „Tür“ anlegen"}.</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(i.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>` : u}
            </li>`;
    })}
        </ul>
        ${this.kannAendern ? this.renderProfil() : u}
      </div>
    </aside>`;
  }
  renderNeuRaum() {
    const e = this.kandidaten, t = this.neuRaum;
    if (!t)
      return c`<div class="actions">
        <button
          class="text small"
          @click=${() => {
        this.neuRaum = { name: "", art: "melder", melder: [], device_id: "", bereich_id: "" }, this.loadKandidaten();
      }}
        >
          <ha-icon icon="mdi:plus"></ha-icon>Raum hinzufügen
        </button>
      </div>`;
    const n = (o) => this.neuRaum = { ...t, ...o }, s = e?.vorschlaege ?? [], i = (e?.fp400 ?? []).filter((o) => !o.benutzt), r = t.name.trim() && (t.art === "melder" ? t.melder.length > 0 : !!t.device_id), a = (o) => {
      const l = t.melder.includes(o.id);
      return c`<li>
        <label class="check"
          ><input
            type="checkbox"
            .checked=${l}
            ?disabled=${!!o.benutzt_von && !l}
            @change=${(h) => {
        const d = h.target.checked, p = d ? [...t.melder, o.id] : t.melder.filter(($) => $ !== o.id);
        n({ melder: p, bereich_id: t.bereich_id || (d ? o.bereich_id ?? "" : t.bereich_id) });
      }}
          /><span
            >${o.name}<small
              >${this.bereichName(o.bereich_id)} · ${o.klasse === "motion" ? "Bewegung" : "Anwesenheit"}${o.benutzt_von ? ` · schon in „${this.data?.raeume.find((h) => h.id === o.benutzt_von)?.name ?? o.benutzt_von}“` : ""}</small
            ></span
          ></label
        >
      </li>`;
    };
    return c`<div class="neu-raum">
      <h3>Raum hinzufügen</h3>
      ${e ? c`${s.length ? c`<div class="label-text">Aus Home Assistant übernehmen</div>
                  <ul class="list">
                    ${s.map(
      (o) => c`<li class="item">
                        <div class="row static">
                          <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
                          <span class="name">${o.name}<small>${o.melder.length} ${o.melder.length === 1, "Melder"} in diesem Bereich</small></span>
                          <button class="text small" ?disabled=${this.saving} @click=${() => this.createRoom({ name: o.name, art: "melder", melder: o.melder, bereich_id: o.bereich_id })}>
                            Übernehmen
                          </button>
                        </div>
                      </li>`
    )}
                  </ul>` : u}
            <div class="label-text">Selbst anlegen</div>
            <label class="field">Name<input type="text" .value=${t.name} maxlength="60" @input=${(o) => n({ name: o.target.value })} /></label>
            <div class="levels" role="group" aria-label="Art des Raums">
              <button class=${t.art === "melder" ? "active" : ""} @click=${() => n({ art: "melder" })}><ha-icon icon="mdi:motion-sensor"></ha-icon>Bewegungsmelder</button>
              <button class=${t.art === "radar" ? "active" : ""} @click=${() => n({ art: "radar" })}><ha-icon icon="mdi:radar"></ha-icon>Radarsensor FP400</button>
            </div>
            ${t.art === "melder" ? e.melder.length ? c`<ul class="melder-liste">
                    ${e.melder.map(a)}
                  </ul>` : c`<p class="hint small">Keine Bewegungs- oder Präsenzmelder in Home Assistant gefunden.</p>` : i.length ? c`<label class="field"
                    >Gerät<select @change=${(o) => n({ device_id: o.target.value })}>
                      <option value="" ?selected=${!t.device_id}>bitte wählen</option>
                      ${i.map((o) => c`<option value=${o.device_id} ?selected=${t.device_id === o.device_id}>${o.name}</option>`)}
                    </select></label
                  >` : c`<p class="hint small">Kein freier FP400 gefunden (alle sind schon einem Raum zugeordnet).</p>`}
            <label class="field"
              >Bereich in Home Assistant<select @change=${(o) => n({ bereich_id: o.target.value })}>
                <option value="" ?selected=${!t.bereich_id}>keiner</option>
                ${e.bereiche.map((o) => c`<option value=${o.bereich_id} ?selected=${t.bereich_id === o.bereich_id}>${o.name}</option>`)}
              </select></label
            >
            ${this.dirty ? c`<p class="note warn">Erst den Hausplan speichern oder verwerfen.</p>` : u}` : c`<p class="hint">Lädt …</p>`}
      <div class="actions">
        <button class="text small" @click=${() => this.neuRaum = null}>Abbrechen</button>
        <span class="spacer"></span>
        <button class="primary" ?disabled=${!r || this.saving || this.dirty} @click=${() => this.createRoom(t)}><ha-icon icon="mdi:plus"></ha-icon>Anlegen</button>
      </div>
    </div>`;
  }
  /** Bewegungsprofil des Hauses: je Raum eine Zeitleiste, dazu die Wechsel. */
  renderProfil() {
    const e = this.profil, t = this.data?.raeume ?? [], n = (r) => t.find((a) => a.id === r)?.name ?? r, s = (r) => {
      const a = Math.max(1, e.bis - e.von);
      return c`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
        <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
        ${r.map(([o, l]) => b`<rect x=${((o - e.von) / a * 1e3).toFixed(1)} y="0" width=${Math.max(3, (l - o) / a * 1e3).toFixed(1)} height="10" fill="var(--rz-bereich)" />`)}
      </svg>`;
    }, i = e ? gn(e.raeume).slice(-12).reverse() : [];
    return c`<h3>Bewegungsprofil</h3>
      <div class="label-text">Wann war wo jemand? Die letzten</div>
      <div class="levels" role="group" aria-label="Zeitraum">
        <button class=${this.profilStunden === 0 ? "active" : ""} @click=${() => this.loadProfil(0)}>aus</button>
        ${Qe.map((r) => c`<button class=${this.profilStunden === r ? "active" : ""} @click=${() => this.loadProfil(r)}>${r} h</button>`)}
      </div>
      ${this.profilLaedt ? c`<p class="hint">Rechnet …</p>` : e ? c`<ul class="list ausw">
                ${t.map((r) => {
      const a = e.raeume[r.id];
      return c`<li class="item" style="--zone:var(--rz-bereich)">
                    <div class="row static">
                      <span class="name">${r.name}<small>${a ? a.length ? `${a.length}-mal` : "niemand" : "keine Aufnahme"}</small></span>
                      <span class="dauer">${a?.length ? te(mn(a)) : ""}</span>
                    </div>
                    ${a ? s(a) : u}
                  </li>`;
    })}
              </ul>
              <div class="achse"><span>${this.uhr(e.von)}</span><span>${this.uhr(e.bis)}</span></div>
              ${i.length ? c`<div class="label-text">Letzte Wechsel zwischen Räumen</div>
                    <ul class="doors">
                      ${i.map((r) => c`<li class="door"><ha-icon icon="mdi:arrow-right"></ha-icon><span>${this.uhr(r.zeit)} ${n(r.von)} → ${n(r.nach)}</span></li>`)}
                    </ul>` : u}
              <p class="hint small">
                Ein Wechsel heißt: In einem Raum endet die Bewegung, im anderen beginnt sie kurz danach. Welche Person es war, weiß Raumzonen noch nicht;
                das ist der nächste Schritt.
              </p>` : u}`;
  }
  uhr(e) {
    return new Date(e * 1e3).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  }
  /** Zeitleiste: wann im gewählten Zeitraum jemand da war. */
  renderLeiste(e, t) {
    const n = this.ausw, s = Math.max(1, n.bis - n.von);
    return c`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
      <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
      ${e.map(([i, r]) => {
      const a = (i - n.von) / s * 1e3, o = Math.max(3, (r - i) / s * 1e3);
      return b`<rect x=${a.toFixed(1)} y="0" width=${o.toFixed(1)} height="10" fill=${t} />`;
    })}
    </svg>`;
  }
  figurName(e) {
    return e.figur === "kurz" ? "Kurze Spuren" : `${e.hund ? "Hund?" : "Figur"} ${e.nummer}`;
  }
  renderAuswertungTab() {
    const e = this.ausw, t = (o) => o === O && this.istMelder ? "Jemand da" : this.zones.find((l) => l.id === o)?.name ?? o, n = (o) => {
      const l = this.zones.find((h) => h.id === o);
      return l ? K(B(l)) : o === O ? "var(--rz-bereich)" : "var(--muted)";
    }, s = c`<div class="levels" role="group" aria-label="Zeitraum">
      ${Qe.map(
      (o) => c`<button
          class=${this.auswStunden === o ? "active" : ""}
          @click=${() => {
        this.auswStunden = o, this.loadAuswertung();
      }}
        >
          ${o} h
        </button>`
    )}
    </div>`, i = c`<h3>Wer war wann wo?</h3>
      <div class="label-text">Die letzten</div>
      ${s}`;
    if (this.auswFehler === "off")
      return c`${i}<p class="note">Die Aufnahme ist für diesen Raum aus. Einschalten unter <b>Sensor und Raum → Aufnahme</b>; ausgewertet wird ab dann.</p>`;
    if (this.auswFehler) return c`${i}<p class="note warn">${this.auswFehler}</p>`;
    if (!e) return c`${i}<p class="hint">${this.auswLaedt ? "Rechnet …" : "Noch keine Daten."}</p>`;
    const r = e.zonen.filter((o) => o.sekunden > 0).sort((o, l) => l.belegt_s - o.belegt_s), a = c`<div class="achse"><span>${this.uhr(e.von)}</span><span>${this.uhr(e.bis)}</span></div>`;
    return c`${i}
      <p class="hint small">${this.auswLaedt ? "Rechnet …" : `${this.uhr(e.von)} bis ${this.uhr(e.bis)}. Die Karte zeigt, wo jemand war: je dunkler, desto länger. Bei den Zonen steht, wie lange dort jemand war.`}</p>
      <h3>Zonen</h3>
      ${r.length ? c`<ul class="list ausw">
            ${r.map(
      (o) => c`<li class="item" style="--zone:${n(o.zone_id)}">
                <div class="row static">
                  <span class="dot"></span>
                  <span class="name">${t(o.zone_id)}<small>${o.figuren.length ? o.figuren.map((l) => this.figurName(e.figuren.find((h) => h.figur === l))).join(", ") : "nur kurz"}</small></span>
                  <span class="dauer" title=${o.sekunden > o.belegt_s + 60 ? `Alle Figuren zusammen: ${te(o.sekunden)}` : ""}>${te(o.belegt_s)}</span>
                </div>
                ${this.renderLeiste(o.abschnitte, "var(--zone)")}
              </li>`
    )}
          </ul>
          ${a}` : c`<p class="hint">In diesem Zeitraum war niemand in einer Zone.</p>`}
      ${this.istMelder ? c`<p class="hint small">Melder kennen keine Position; darum gibt es hier keine Karte und keine Figuren.</p>` : this.renderFiguren(e, t, a)}`;
  }
  renderFiguren(e, t, n) {
    return c`<h3>Figuren</h3>
      ${e.figuren.length ? c`<ul class="list ausw">
            ${e.figuren.map((s) => {
      const i = this.auswFigur === s.figur, r = s.hund ? "var(--rz-tier)" : "var(--rz-person)", a = Object.keys(s.zonen).slice(0, 2).map(t).join(", ");
      return c`<li class="item ${i ? "open" : ""}" style="--zone:${r}">
                <div class="row" role="button" aria-pressed=${i ? "true" : "false"} title="Nur diese Figur auf der Karte zeigen" @click=${() => this.auswFigur = i ? "" : s.figur}>
                  <span class="dot"></span>
                  <span class="name">${this.figurName(s)}<small>${this.uhr(s.erst)} bis ${this.uhr(s.zuletzt)}${a ? ` · ${a}` : ""}</small></span>
                  <span class="dauer">${te(s.sekunden)}</span>
                </div>
                ${this.renderLeiste(s.abschnitte, "var(--zone)")}
              </li>`;
    })}
          </ul>
          ${n}
          <p class="hint small">
            Antippen zeigt nur diese Figur auf der Karte. Eine Figur ist eine Spur vom Auftauchen bis zum Verschwinden. Wer aufsteht und
            später wiederkommt, kann eine neue Nummer bekommen. Welche Person es ist, weiß Raumzonen noch nicht.
          </p>` : c`<p class="hint">Keine Figuren in diesem Zeitraum.</p>`}`;
  }
  renderSide() {
    return this.page === "haus" ? this.renderHausSide() : c`<aside class="side">
      <div class="tabs" role="tablist">
        ${this.istMelder ? u : c`<button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => this.openTab("zonen")}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>`}
        <button class=${this.tab === "raum" ? "active" : ""} role="tab" @click=${() => this.openTab("raum")}><ha-icon icon="mdi:floor-plan"></ha-icon>${this.istMelder ? "Melder und Raum" : "Sensor und Raum"}</button>
        ${this.kannAendern ? c`<button class=${this.tab === "auswertung" ? "active" : ""} role="tab" @click=${() => this.openTab("auswertung")}><ha-icon icon="mdi:chart-bubble"></ha-icon>Auswertung</button>` : u}
      </div>
      <div class="side-body">${this.tab === "zonen" ? this.renderZonesTab() : this.tab === "raum" ? this.renderRoomTab() : this.renderAuswertungTab()}</div>
    </aside>`;
  }
  // -- Ganze Seite ------------------------------------------------------------------
  renderHeader() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem;
    return c`<header>
      <button class="icon menu" title="Menü" @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: !0, composed: !0 }))}>
        <ha-icon icon="mdi:menu"></ha-icon>
      </button>
      <span class="title">Raumzonen</span>
      ${this.data?.raeume.length ? c`<nav class="pages">
            <button class=${this.page === "haus" ? "active" : ""} @click=${() => this.openHaus()}><ha-icon icon="mdi:home-outline"></ha-icon>Haus</button>
            ${this.data.raeume.map(
      (n) => c`<button class=${this.page === "raum" && n.id === this.raumId ? "active" : ""} @click=${() => this.selectRoom(n.id)}>${n.name}</button>`
    )}
          </nav>` : u}
      ${this.raum && this.page === "raum" ? c`<span class="live-chip ${t ? "ok" : "down"}" title=${e?.problem ?? ""}><span class="led"></span><span class="text">${t ? "live" : "nicht erreichbar"}</span></span>` : u}
      <span class="spacer"></span>
      ${this.raum && !this.kannAendern ? c`<span class="badge off" title="Ändern dürfen nur Admins">nur ansehen</span>` : u}
      ${this.raum && this.kannAendern ? c`${this.page === "raum" ? c`<button class="icon" title="Rückgängig (Strg+Z)" ?disabled=${!this.history.size} @click=${this.undo}><ha-icon icon="mdi:undo"></ha-icon></button>` : u}
            <button class="text" ?disabled=${!this.dirty || this.saving} @click=${this.discard}><span class="label">Verwerfen</span><ha-icon icon="mdi:close" style=${this.narrow ? "" : "display:none"}></ha-icon></button>
            <button class="primary" ?disabled=${!this.dirty || this.saving} @click=${() => this.page === "haus" ? this.saveHaus() : this.save()}>
              <ha-icon icon="mdi:content-save-outline"></ha-icon><span class="label">${this.saving ? "Speichert …" : "Speichern"}</span>
            </button>` : u}
    </header>`;
  }
  render() {
    return this.data ? this.data.raeume.length ? c`${this.renderHeader()}
      <div class="layout">${this.renderStage()} ${this.renderSide()}</div>
      ${this.toast ? c`<div class="toast" role="status">${this.toast}</div>` : u}` : c`${this.renderHeader()}
        <div class="empty">
          <ha-icon icon="mdi:floor-plan"></ha-icon>
          <p>
            Noch kein Raum. Einen Raum legst du unter <b>Einstellungen → Geräte &amp; Dienste → Raumzonen → Konfigurieren → Raum
            hinzufügen</b> an. Danach erscheint er hier zum Einzeichnen.
          </p>
        </div>` : c`${this.renderHeader()}<div class="empty">${this.error ? c`<ha-icon icon="mdi:alert-circle-outline"></ha-icon><p>${this.error}</p>` : c`<p>Lädt …</p>`}</div>`;
  }
};
f.styles = on;
m([
  ot({ type: Boolean, reflect: !0 })
], f.prototype, "narrow", 2);
m([
  g()
], f.prototype, "data", 2);
m([
  g()
], f.prototype, "raumId", 2);
m([
  g()
], f.prototype, "zones", 2);
m([
  g()
], f.prototype, "sensor", 2);
m([
  g()
], f.prototype, "umriss", 2);
m([
  g()
], f.prototype, "oeffnungen", 2);
m([
  g()
], f.prototype, "selVertex", 2);
m([
  g()
], f.prototype, "selOpening", 2);
m([
  g()
], f.prototype, "openingDraft", 2);
m([
  g()
], f.prototype, "selected", 2);
m([
  g()
], f.prototype, "sensorOpen", 2);
m([
  g()
], f.prototype, "tab", 2);
m([
  g()
], f.prototype, "tool", 2);
m([
  g()
], f.prototype, "draft", 2);
m([
  g()
], f.prototype, "rectDraft", 2);
m([
  g()
], f.prototype, "hover", 2);
m([
  g()
], f.prototype, "view", 2);
m([
  g()
], f.prototype, "size", 2);
m([
  g()
], f.prototype, "live", 2);
m([
  g()
], f.prototype, "heat", 2);
m([
  g()
], f.prototype, "heatMin", 2);
m([
  g()
], f.prototype, "ausw", 2);
m([
  g()
], f.prototype, "auswStunden", 2);
m([
  g()
], f.prototype, "auswLaedt", 2);
m([
  g()
], f.prototype, "auswFehler", 2);
m([
  g()
], f.prototype, "kandidaten", 2);
m([
  g()
], f.prototype, "neuRaum", 2);
m([
  g()
], f.prototype, "profil", 2);
m([
  g()
], f.prototype, "profilStunden", 2);
m([
  g()
], f.prototype, "profilLaedt", 2);
m([
  g()
], f.prototype, "auswFigur", 2);
m([
  g()
], f.prototype, "layersOpen", 2);
m([
  g()
], f.prototype, "layers", 2);
m([
  g()
], f.prototype, "dirty", 2);
m([
  g()
], f.prototype, "zonesFollow", 2);
m([
  g()
], f.prototype, "saving", 2);
m([
  g()
], f.prototype, "error", 2);
m([
  g()
], f.prototype, "toast", 2);
m([
  g()
], f.prototype, "page", 2);
m([
  g()
], f.prototype, "lagen", 2);
m([
  g()
], f.prototype, "tueren", 2);
m([
  g()
], f.prototype, "hausLive", 2);
m([
  g()
], f.prototype, "hausSel", 2);
m([
  g()
], f.prototype, "aufnahme", 2);
m([
  g()
], f.prototype, "melder", 2);
m([
  g()
], f.prototype, "nachlauf", 2);
m([
  g()
], f.prototype, "aufnahmeTage", 2);
f = m([
  Ht("raumzonen-panel")
], f);
export {
  f as RaumzonenPanel
};
