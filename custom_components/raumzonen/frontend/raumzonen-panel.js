/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, be = te.ShadowRoot && (te.ShadyCSS === void 0 || te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $e = Symbol(), Ee = /* @__PURE__ */ new WeakMap();
let Qe = class {
  constructor(e, s, n) {
    if (this._$cssResult$ = !0, n !== $e) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (be && e === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (e = Ee.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && Ee.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ct = (t) => new Qe(typeof t == "string" ? t : t + "", void 0, $e), dt = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((n, i, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[r + 1], t[0]);
  return new Qe(s, t, $e);
}, ut = (t, e) => {
  if (be) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const n = document.createElement("style"), i = te.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, t.appendChild(n);
  }
}, Pe = be ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const n of e.cssRules) s += n.cssText;
  return ct(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: pt, defineProperty: ft, getOwnPropertyDescriptor: gt, getOwnPropertyNames: mt, getOwnPropertySymbols: bt, getPrototypeOf: $t } = Object, oe = globalThis, Re = oe.trustedTypes, xt = Re ? Re.emptyScript : "", vt = oe.reactiveElementPolyfillSupport, B = (t, e) => t, ie = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? xt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, xe = (t, e) => !pt(t, e), Oe = { attribute: !0, type: String, converter: ie, reflect: !1, useDefault: !1, hasChanged: xe };
Symbol.metadata ??= Symbol("metadata"), oe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let I = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Oe) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, s);
      i !== void 0 && ft(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, n) {
    const { get: i, set: r } = gt(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const a = i?.call(this);
      r?.call(this, o), this.requestUpdate(e, a, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(B("elementProperties"))) return;
    const e = $t(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(B("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(B("properties"))) {
      const s = this.properties, n = [...mt(s), ...bt(s)];
      for (const i of n) this.createProperty(i, s[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [n, i] of s) this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, n] of this.elementProperties) {
      const i = this._$Eu(s, n);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const i of n) s.unshift(Pe(i));
    } else e !== void 0 && s.push(Pe(e));
    return s;
  }
  static _$Eu(e, s) {
    const n = s.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const n of s.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ut(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, n) {
    this._$AK(e, n);
  }
  _$ET(e, s) {
    const n = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, n);
    if (i !== void 0 && n.reflect === !0) {
      const r = (n.converter?.toAttribute !== void 0 ? n.converter : ie).toAttribute(s, n.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = n.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ie;
      this._$Em = i;
      const a = o.fromAttribute(s, r.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, s, n, i = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[e]), n ??= o.getPropertyOptions(e), !((n.hasChanged ?? xe)(r, s) || n.useDefault && n.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, n)))) return;
      this.C(e, s, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: n, reflect: i, wrapped: r }, o) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
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
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, r] of n) {
        const { wrapped: o } = r, a = this[i];
        o !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, r, a);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (n) {
      throw e = !1, this._$EM(), n;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
I.elementStyles = [], I.shadowRootOptions = { mode: "open" }, I[B("elementProperties")] = /* @__PURE__ */ new Map(), I[B("finalized")] = /* @__PURE__ */ new Map(), vt?.({ ReactiveElement: I }), (oe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = globalThis, Te = (t) => t, re = ve.trustedTypes, He = re ? re.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, et = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, tt = "?" + S, yt = `<${tt}>`, O = document, V = () => O.createComment(""), K = (t) => t === null || typeof t != "object" && typeof t != "function", ye = Array.isArray, kt = (t) => ye(t) || typeof t?.[Symbol.iterator] == "function", he = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ce = /-->/g, De = />/g, E = RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ie = /'/g, Ze = /"/g, st = /^(?:script|style|textarea|title)$/i, nt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), c = nt(1), g = nt(2), N = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Ne = /* @__PURE__ */ new WeakMap(), R = O.createTreeWalker(O, 129);
function it(t, e) {
  if (!ye(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return He !== void 0 ? He.createHTML(e) : e;
}
const wt = (t, e) => {
  const s = t.length - 1, n = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = W;
  for (let a = 0; a < s; a++) {
    const l = t[a];
    let h, p, u = -1, x = 0;
    for (; x < l.length && (o.lastIndex = x, p = o.exec(l), p !== null); ) x = o.lastIndex, o === W ? p[1] === "!--" ? o = Ce : p[1] !== void 0 ? o = De : p[2] !== void 0 ? (st.test(p[2]) && (i = RegExp("</" + p[2], "g")), o = E) : p[3] !== void 0 && (o = E) : o === E ? p[0] === ">" ? (o = i ?? W, u = -1) : p[1] === void 0 ? u = -2 : (u = o.lastIndex - p[2].length, h = p[1], o = p[3] === void 0 ? E : p[3] === '"' ? Ze : Ie) : o === Ze || o === Ie ? o = E : o === Ce || o === De ? o = W : (o = E, i = void 0);
    const f = o === E && t[a + 1].startsWith("/>") ? " " : "";
    r += o === W ? l + yt : u >= 0 ? (n.push(h), l.slice(0, u) + et + l.slice(u) + S + f) : l + S + (u === -2 ? a : f);
  }
  return [it(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class q {
  constructor({ strings: e, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const a = e.length - 1, l = this.parts, [h, p] = wt(e, s);
    if (this.el = q.createElement(h, n), R.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = R.nextNode()) !== null && l.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(et)) {
          const x = p[o++], f = i.getAttribute(u).split(S), v = /([.?@])?(.*)/.exec(x);
          l.push({ type: 1, index: r, name: v[2], strings: f, ctor: v[1] === "." ? _t : v[1] === "?" ? At : v[1] === "@" ? St : ae }), i.removeAttribute(u);
        } else u.startsWith(S) && (l.push({ type: 6, index: r }), i.removeAttribute(u));
        if (st.test(i.tagName)) {
          const u = i.textContent.split(S), x = u.length - 1;
          if (x > 0) {
            i.textContent = re ? re.emptyScript : "";
            for (let f = 0; f < x; f++) i.append(u[f], V()), R.nextNode(), l.push({ type: 2, index: ++r });
            i.append(u[x], V());
          }
        }
      } else if (i.nodeType === 8) if (i.data === tt) l.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(S, u + 1)) !== -1; ) l.push({ type: 7, index: r }), u += S.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const n = O.createElement("template");
    return n.innerHTML = e, n;
  }
}
function L(t, e, s = t, n) {
  if (e === N) return e;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const r = K(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(t), i._$AT(t, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (e = L(t, i._$AS(t, e.values), i, n)), e;
}
class zt {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: n } = this._$AD, i = (e?.creationScope ?? O).importNode(s, !0);
    R.currentNode = i;
    let r = R.nextNode(), o = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new G(r, r.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (h = new Mt(r, this, e)), this._$AV.push(h), l = n[++a];
      }
      o !== l?.index && (r = R.nextNode(), o++);
    }
    return R.currentNode = O, i;
  }
  p(e) {
    let s = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, s), s += n.strings.length - 2) : n._$AI(e[s])), s++;
  }
}
class G {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, n, i) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && e?.nodeType === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = L(this, e, s), K(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== N && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : kt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && K(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = q.createElement(it(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const r = new zt(i, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = Ne.get(e.strings);
    return s === void 0 && Ne.set(e.strings, s = new q(e)), s;
  }
  k(e) {
    ye(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const r of e) i === s.length ? s.push(n = new G(this.O(V()), this.O(V()), this, this.options)) : n = s[i], n._$AI(r), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const n = Te(e).nextSibling;
      Te(e).remove(), e = n;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ae {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, n, i, r) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = d;
  }
  _$AI(e, s = this, n, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = L(this, e, s, 0), o = !K(e) || e !== this._$AH && e !== N, o && (this._$AH = e);
    else {
      const a = e;
      let l, h;
      for (e = r[0], l = 0; l < r.length - 1; l++) h = L(this, a[n + l], s, l), h === N && (h = this._$AH[l]), o ||= !K(h) || h !== this._$AH[l], h === d ? e = d : e !== d && (e += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class _t extends ae {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class At extends ae {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class St extends ae {
  constructor(e, s, n, i, r) {
    super(e, s, n, i, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = L(this, e, s, 0) ?? d) === N) return;
    const n = this._$AH, i = e === d && n !== d || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, r = e !== d && (n === d || i);
    i && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Mt {
  constructor(e, s, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    L(this, e);
  }
}
const Et = ve.litHtmlPolyfillSupport;
Et?.(q, G), (ve.litHtmlVersions ??= []).push("3.3.3");
const Pt = (t, e, s) => {
  const n = s?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const r = s?.renderBefore ?? null;
    n._$litPart$ = i = new G(e.insertBefore(V(), r), r, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis;
class F extends I {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Pt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return N;
  }
}
F._$litElement$ = !0, F.finalized = !0, ke.litElementHydrateSupport?.({ LitElement: F });
const Rt = ke.litElementPolyfillSupport;
Rt?.({ LitElement: F });
(ke.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ot = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tt = { attribute: !0, type: String, converter: ie, reflect: !1, hasChanged: xe }, Ht = (t = Tt, e, s) => {
  const { kind: n, metadata: i } = s;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), n === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), n === "accessor") {
    const { name: o } = s;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, l, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, t, a), a;
    } };
  }
  if (n === "setter") {
    const { name: o } = s;
    return function(a) {
      const l = this[o];
      e.call(this, a), this.requestUpdate(o, l, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function rt(t) {
  return (e, s) => typeof s == "object" ? Ht(t, e, s) : ((n, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(t) {
  return rt({ ...t, state: !0, attribute: !1 });
}
const Ct = 25;
function ot(t) {
  return t * Math.PI / 180;
}
function U([t, e], s, [n, i] = [0, 0]) {
  const r = ot(s), o = Math.cos(r), a = Math.sin(r), l = t - n, h = e - i;
  return [n + l * o - h * a, i + l * a + h * o];
}
function pe(t, e) {
  return Math.hypot(t[0] - e[0], t[1] - e[1]);
}
function Dt(t, e) {
  return [Math.round(t[0] / e) * e, Math.round(t[1] / e) * e];
}
function T(t) {
  return [Math.round(t[0] * 10) / 10, Math.round(t[1] * 10) / 10];
}
function se(t, e, s, n) {
  const i = e / 2, r = s / 2;
  return [
    [-i, -r],
    [i, -r],
    [i, r],
    [-i, r]
  ].map((o) => U([t[0] + o[0], t[1] + o[1]], n, t));
}
function we(t) {
  const e = t.x0 ?? 0, s = t.y0 ?? 0;
  return t.zellen.map(([n, i]) => ({ x: e + n * t.groesse, y: s + i * t.groesse, s: t.groesse }));
}
function ze(t, e, s = 0, n = 0) {
  return [Math.floor((t[0] - s) / e), Math.floor((t[1] - n) / e)];
}
function Z(t) {
  if (t.art === "vieleck") return t.punkte;
  if (t.art === "rechteck") return se(t.mitte, t.breite, t.tiefe, t.winkel);
  const e = we(t), s = e.flatMap((l) => [l.x, l.x + l.s]), n = e.flatMap((l) => [l.y, l.y + l.s]);
  if (!s.length) return [];
  const [i, r, o, a] = [Math.min(...s), Math.max(...s), Math.min(...n), Math.max(...n)];
  return [
    [i, o],
    [r, o],
    [r, a],
    [i, a]
  ];
}
function It([t, e], s) {
  let n = !1;
  for (let i = 0, r = s.length - 1; i < s.length; r = i++) {
    const [o, a] = s[i], [l, h] = s[r];
    a > e != h > e && t < o + (e - a) * (l - o) / (h - a) && (n = !n);
  }
  return n;
}
function Le(t, e) {
  if (e.art === "zellen") {
    const [s, n] = ze(t, e.groesse, e.x0 ?? 0, e.y0 ?? 0);
    return e.zellen.some(([i, r]) => i === s && r === n);
  }
  return It(t, Z(e));
}
function Zt(t) {
  if (!t.length) return [0, 0];
  let e = 0, s = 0, n = 0;
  for (let i = 0, r = t.length - 1; i < t.length; r = i++) {
    const [o, a] = t[r], [l, h] = t[i], p = o * h - l * a;
    e += p, s += (o + l) * p, n += (a + h) * p;
  }
  return Math.abs(e) < 1e-9 ? [t.reduce((i, r) => i + r[0], 0) / t.length, t.reduce((i, r) => i + r[1], 0) / t.length] : [s / (3 * e), n / (3 * e)];
}
function z(t) {
  if (t.art === "rechteck") return t.mitte;
  if (t.art === "zellen") {
    const e = we(t), s = e.length || 1;
    return [e.reduce((n, i) => n + i.x + i.s / 2, 0) / s, e.reduce((n, i) => n + i.y + i.s / 2, 0) / s];
  }
  return Zt(t.punkte);
}
function Nt(t) {
  let e = 0;
  for (let s = 0, n = t.length - 1; s < t.length; n = s++)
    e += t[n][0] * t[s][1] - t[s][0] * t[n][1];
  return Math.abs(e) / 2;
}
function J(t, e, s) {
  return (e[0] - t[0]) * (s[1] - t[1]) - (e[1] - t[1]) * (s[0] - t[0]);
}
function Lt(t) {
  const e = t.length;
  for (let s = 0; s < e; s++)
    for (let n = s + 1; n < e; n++) {
      if (Math.abs(s - n) === 1 || Math.abs(s - n) === e - 1) continue;
      const [i, r] = [t[s], t[(s + 1) % e]], [o, a] = [t[n], t[(n + 1) % e]];
      if (J(i, r, o) * J(i, r, a) < 0 && J(o, a, i) * J(o, a, r) < 0) return !0;
    }
  return !1;
}
function fe(t) {
  return t.art === "zellen" ? t.zellen.length ? "" : "Keine Zelle gewählt" : t.art === "rechteck" ? t.breite > 0 && t.tiefe > 0 ? "" : "Rechteck ohne Fläche" : t.punkte.length < 3 ? "Mindestens drei Ecken" : Lt(t.punkte) ? "Kanten überschneiden sich" : Nt(t.punkte) < 1 ? "Vieleck ohne Fläche" : "";
}
function ge(t, e, s) {
  if (t.art === "vieleck") return { ...t, punkte: t.punkte.map((r) => T([r[0] + e, r[1] + s])) };
  if (t.art === "rechteck") return { ...t, mitte: T([t.mitte[0] + e, t.mitte[1] + s]) };
  const n = Math.round(e / t.groesse), i = Math.round(s / t.groesse);
  return { ...t, zellen: t.zellen.map(([r, o]) => [r + n, o + i]) };
}
function at(t) {
  const e = ot(t);
  return [-Math.sin(e), Math.cos(e)];
}
function Ue(t, e, s, n, i = 36) {
  const r = [];
  n >= 360 || r.push(t);
  const a = e - n / 2;
  for (let l = 0; l <= i; l++) {
    const h = a + n * l / i, [p, u] = at(h);
    r.push([t[0] + p * s, t[1] + u * s]);
  }
  return r;
}
function Ut(t, e) {
  const s = U(t, e.winkel);
  return [e.x + s[0], e.y + s[1]];
}
function ce(t, e) {
  const s = Math.atan2(-(e[0] - t[0]), e[1] - t[1]) * 180 / Math.PI;
  return Math.round(s * 10) / 10;
}
function de(t, e, s) {
  const n = s[0] - e[0], i = s[1] - e[1], r = n * n + i * i;
  if (r === 0) return pe(t, e);
  const o = Math.max(0, Math.min(1, ((t[0] - e[0]) * n + (t[1] - e[1]) * i) / r));
  return pe(t, [e[0] + o * n, e[1] + o * i]);
}
function jt(t, e) {
  return U([t[0] - e.x, t[1] - e.y], -e.winkel);
}
function Wt(t, e, s) {
  const n = (i) => T(Ut(jt(i, e), s));
  if (t.art === "vieleck") return { ...t, punkte: t.punkte.map(n) };
  if (t.art === "rechteck") {
    let i = t.winkel + s.winkel - e.winkel;
    return i > 180 && (i -= 360), i <= -180 && (i += 360), { ...t, mitte: n(t.mitte), winkel: Math.round(i * 10) / 10 };
  }
  return e.winkel !== s.winkel ? t : ge(t, s.x - e.x, s.y - e.y);
}
function A(t, e) {
  const [s, n] = U(t, e.winkel);
  return [s + e.x, n + e.y];
}
function Bt(t, e, s) {
  if (t.length >= 3) return t;
  const n = [s];
  for (const u of e) n.push(...Z(u));
  const i = n.map((u) => u[0]), r = n.map((u) => u[1]), o = 40, [a, l] = [Math.min(...i) - o, Math.max(...i) + o], [h, p] = [Math.min(...r) - o, Math.max(...r) + o];
  return [
    [a, h],
    [l, h],
    [l, p],
    [a, p]
  ];
}
function Ft(t, e = 100) {
  const s = {};
  let n = -1 / 0;
  for (const i of t)
    if (i.lage) {
      s[i.id] = i.lage;
      for (const r of i.outline) n = Math.max(n, A(r, i.lage)[0]);
    }
  n === -1 / 0 && (n = -e);
  for (const i of t) {
    if (i.lage) continue;
    const r = Math.min(...i.outline.map((l) => l[0])), o = Math.max(...i.outline.map((l) => l[0])), a = { x: n + e - r, y: 0, winkel: 0 };
    s[i.id] = a, n = a.x + o;
  }
  return s;
}
const lt = {
  normal: "normal",
  ausgang: "ausgang",
  hundeplatz: "hundeplatz",
  stoerquelle: "stoerquelle",
  stelle: "stelle",
  durchgang: "durchgang"
};
class Vt {
  constructor(e = 100) {
    this.limit = e, this.stack = [];
  }
  push(e) {
    const s = JSON.stringify(e);
    this.stack[this.stack.length - 1] !== s && (this.stack.push(s), this.stack.length > this.limit && this.stack.shift());
  }
  undo() {
    const e = this.stack.pop();
    return e === void 0 ? void 0 : JSON.parse(e);
  }
  get size() {
    return this.stack.length;
  }
  clear() {
    this.stack = [];
  }
}
function ht(t, e) {
  const s = new Set(e.map((i) => i.name));
  if (!s.has(t)) return t;
  let n = 2;
  for (; s.has(`${t} ${n}`); ) n++;
  return `${t} ${n}`;
}
function Kt(t, e, s, n = "normal") {
  return {
    name: ht("Zone", e),
    art: n,
    form: t,
    regel: { ...s[lt[n]] }
  };
}
function qt(t, e, s) {
  if (t.art !== "vieleck") return t;
  const n = t.punkte.slice();
  return n[e] = T(s), { ...t, punkte: n };
}
function je(t, e, s) {
  if (t.art !== "vieleck") return t;
  const n = t.punkte.slice();
  return n.splice(e + 1, 0, T(s)), { ...t, punkte: n };
}
function Gt(t, e) {
  return t.art !== "vieleck" || t.punkte.length <= 3 ? t : { ...t, punkte: t.punkte.filter((s, n) => n !== e) };
}
function We(t, e, s) {
  const [n, i] = ze(e, t.groesse, t.x0 ?? 0, t.y0 ?? 0), r = t.zellen.some(([o, a]) => o === n && a === i);
  return s && !r ? { ...t, zellen: [...t.zellen, [n, i]] } : !s && r ? { ...t, zellen: t.zellen.filter(([o, a]) => o !== n || a !== i) } : t;
}
function Be(t, e) {
  return {
    art: "rechteck",
    mitte: T([(t[0] + e[0]) / 2, (t[1] + e[1]) / 2]),
    breite: Math.round(Math.abs(e[0] - t[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(e[1] - t[1]) * 10) / 10,
    winkel: 0
  };
}
function Xt(t) {
  for (const e of t) {
    if (!e.name.trim()) return "Eine Zone hat keinen Namen";
    const s = fe(e.form);
    if (s) return `${e.name}: ${s}`;
  }
  return "";
}
function Yt(t, e, s) {
  const n = t.name.toLowerCase(), i = n.includes("bett"), o = n.includes("tür") || n.includes("tuer") || n.includes("door") ? "ausgang" : "normal";
  return {
    name: ht(t.name, e),
    art: o,
    form: t.form,
    regel: { ...s[i ? "bett" : lt[o]] }
  };
}
const me = [
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
function ne(t) {
  return me.find((e) => e.rolle === t) ?? me[1];
}
function Q(t) {
  return t.art === "ausgang" ? "tuer" : t.art === "hundeplatz" ? "hund" : t.art === "stelle" ? "stelle" : t.art === "durchgang" ? "durchgang" : t.art === "stoerquelle" ? "ignorieren" : t.regel.schlaefer_halten ? "bett" : "bereich";
}
function Jt(t, e, s) {
  const n = ne(e), i = { ...t, art: n.art, regel: { ...s[n.vorlage] } };
  return n.art !== "ausgang" && delete i.fuehrt_zu, i;
}
function Fe(t) {
  return t === 0 ? "sofort" : `nach ${String(t).replace(".", ",")} s`;
}
function Ve(t) {
  const e = t.regel;
  if (t.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const s = [`belegt ${Fe(e.belegt_nach_s)}`, `frei ${Fe(e.frei_nach_s)}`];
  e.schlaefer_halten && s.push("hält Schläfer"), e.max_personen === 1 && s.push("eine Person"), e.hund_ignorieren && s.push("ohne Hund");
  const n = s.join(", ");
  return n.charAt(0).toUpperCase() + n.slice(1) + ".";
}
function Qt(t, e, s, n = 10) {
  const i = t.breite / 2, r = t.tiefe / 2, o = [
    e === 0 || e === 3 ? t.mitte[0] + i : t.mitte[0] - i,
    e === 0 || e === 1 ? t.mitte[1] + r : t.mitte[1] - r
  ], a = Math.max(n, Math.abs(s[0] - o[0])), l = Math.max(n, Math.abs(s[1] - o[1])), h = s[0] >= o[0] ? 1 : -1, p = s[1] >= o[1] ? 1 : -1;
  return {
    ...t,
    winkel: 0,
    breite: Math.round(a * 10) / 10,
    tiefe: Math.round(l * 10) / 10,
    mitte: T([o[0] + h * a / 2, o[1] + p * l / 2])
  };
}
function Ke(t, e) {
  const s = t.fuehrt_zu ?? "";
  return s ? s === "aussen" ? "nach draußen oder in einen Raum ohne Sensor" : e.find((n) => n.id === s)?.name ?? "unbekannter Raum" : "noch nicht eingetragen";
}
function es(t) {
  let e = (t % 360 + 540) % 360 - 180;
  return e === -180 && (e = 180), e;
}
const ue = (t) => Math.round(t * 10) / 10 + 0;
function qe(t, e, s) {
  return t.art === "vieleck" ? { ...t, punkte: t.punkte.map((n) => U(n, s, e).map((i) => ue(i))) } : t.art === "rechteck" ? { ...t, mitte: U(t.mitte, s, e).map((n) => ue(n)), winkel: ue(es(t.winkel + s)) } : t;
}
function D(t) {
  return t.map((e, s) => {
    const n = t[(s + 1) % t.length];
    return [(e[0] + n[0]) / 2, (e[1] + n[1]) / 2];
  });
}
function le(t, e) {
  return [t[e], t[(e + 1) % t.length]];
}
function Ge(t, e, s) {
  const [n, i] = le(t, e), r = i[0] - n[0], o = i[1] - n[1], a = Math.hypot(r, o);
  if (!a) return 0;
  const l = ((s[0] - n[0]) * r + (s[1] - n[1]) * o) / a;
  return Math.max(0, Math.min(a, l));
}
function ts(t, e, s, n, i = 20) {
  const [r, o] = le(t, e), a = Math.hypot(o[0] - r[0], o[1] - r[1]);
  let l = Math.round(Ge(t, e, s) / 5) * 5, h = Math.round(Ge(t, e, n) / 5) * 5;
  return h < l && ([l, h] = [h, l]), h - l < i ? null : { kante: e, von: l, bis: Math.min(h, Math.floor(a)), art: "tuer" };
}
function Xe(t, e) {
  const [s, n] = le(t, e.kante), i = Math.hypot(n[0] - s[0], n[1] - s[1]) || 1, r = (o) => [s[0] + (n[0] - s[0]) * o / i, s[1] + (n[1] - s[1]) * o / i];
  return [r(e.von), r(e.bis)];
}
function Ye(t, e, s) {
  const n = [];
  for (const i of t)
    if (e.inserted !== void 0) {
      if (i.kante === e.inserted) continue;
      n.push(i.kante > e.inserted ? { ...i, kante: i.kante + 1 } : i);
    } else if (e.removed !== void 0) {
      const r = (e.removed - 1 + s) % s;
      if (i.kante === e.removed || i.kante === r) continue;
      n.push(i.kante > e.removed ? { ...i, kante: i.kante - 1 } : i);
    }
  return n;
}
function ss(t, e, s = 20) {
  const n = [];
  for (const i of e) {
    if (i.kante >= t.length) continue;
    const [r, o] = le(t, i.kante), a = Math.floor(Math.hypot(o[0] - r[0], o[1] - r[1])), l = Math.min(i.bis, a);
    l - i.von >= s && n.push({ ...i, bis: l });
  }
  return n;
}
const ns = dt`
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
`;
var is = Object.defineProperty, rs = Object.getOwnPropertyDescriptor, b = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? rs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (i = (n ? o(e, s, i) : o(i)) || i);
  return n && i && is(e, s, i), i;
};
const P = "raumzonen", os = 5, _ = 12, Je = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" }
], as = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung."
};
function ee(t) {
  return `var(--rz-${t})`;
}
function ls(t) {
  return t.map((e) => `${e[0].toFixed(1)},${e[1].toFixed(1)}`).join(" ");
}
function hs(t) {
  for (const e of [10, 20, 50, 100, 200, 500, 1e3, 2e3]) if (e >= t) return e;
  return 5e3;
}
let m = class extends F {
  constructor() {
    super(...arguments), this.narrow = !1, this.raumId = "", this.zones = [], this.sensor = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 }, this.umriss = [], this.oeffnungen = [], this.selVertex = -1, this.selOpening = -1, this.openingDraft = null, this.selected = -1, this.sensorOpen = !1, this.tab = "zonen", this.tool = "auswahl", this.draft = [], this.rectDraft = null, this.hover = null, this.view = { cx: 0, cy: 250, scale: 0.8 }, this.size = { w: 800, h: 600 }, this.heatMin = 0, this.layersOpen = !1, this.layers = { figuren: !0, spuren: !0, ziele: !1, abdeckung: !0 }, this.dirty = !1, this.zonesFollow = !0, this.saving = !1, this.error = "", this.toast = "", this.page = "raum", this.lagen = {}, this.tueren = {}, this.hausLive = {}, this.hausSel = "", this.aufnahme = !0, this.aufnahmeTage = 30, this.history = new Vt(), this.drag = null, this.liveRoom = "", this.viewTouched = !1, this.sensorAnchor = null, this.hausUnsubs = [], this.fit = () => {
      const t = this.sensor, e = [[t.x, t.y]];
      if (this.page === "haus" && this.data) {
        e.length = 0;
        for (const u of this.data.raeume) {
          const x = this.lagen[u.id];
          x && e.push(...this.outlineOf(u).map((f) => A(f, x)));
        }
      }
      for (const u of this.zones) e.push(...Z(u.form));
      e.push(...this.umriss), e.length < 4 && this.page === "raum" && e.push(...Ue([t.x, t.y], t.winkel, Math.min(t.reichweite_cm, 500), t.oeffnung_grad, 8));
      const s = e.map((u) => u[0]), n = e.map((u) => u[1]), [i, r, o, a] = [Math.min(...s), Math.max(...s), Math.min(...n), Math.max(...n)], l = Math.max(200, r - i), h = Math.max(200, a - o), p = Math.min(this.size.w / (l * 1.2), this.size.h / (h * 1.2));
      this.view = { cx: (i + r) / 2, cy: (o + a) / 2, scale: Math.max(0.05, Math.min(5, p)) };
    }, this.undo = () => {
      const t = this.history.undo();
      t && (this.zones = t.zones, this.sensor = t.sensor, this.umriss = t.umriss, this.oeffnungen = t.oeffnungen ?? [], this.selVertex = -1, this.selOpening = -1, this.selected >= this.zones.length && (this.selected = -1), this.dirty = !0);
    }, this.finishDraft = () => {
      if (this.draft.length >= 3)
        if (this.tool === "umriss")
          this.remember(), this.umriss = this.draft, this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
        else {
          const t = { art: "vieleck", punkte: this.draft }, e = fe(t);
          e ? this.showToast(e) : this.addZone(t);
        }
      this.draft = [], this.tool = "auswahl";
    }, this.onKey = (t) => {
      const e = t.composedPath()[0];
      e && ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || !this.kannAendern || this.page === "haus" || (t.key === "Escape" ? this.setTool("auswahl") : t.key === "Enter" && this.draft.length ? this.finishDraft() : t.key === "Backspace" && this.draft.length ? this.draft = this.draft.slice(0, -1) : (t.key === "Delete" || t.key === "Backspace") && this.selOpening >= 0 ? (this.deleteOpening(this.selOpening), t.preventDefault()) : (t.key === "Delete" || t.key === "Backspace") && this.selected >= 0 && this.selVertex >= 0 ? (this.deleteVertex(this.selected, this.selVertex), t.preventDefault()) : (t.key === "Delete" || t.key === "Backspace") && this.selected >= 0 ? (this.deleteZone(this.selected), t.preventDefault()) : (t.ctrlKey || t.metaKey) && t.key.toLowerCase() === "z" && (this.undo(), t.preventDefault()));
    }, this.onContextMenu = (t) => {
      if (t.preventDefault(), !this.kannAendern || this.page !== "raum") return;
      const e = this.toWorld(t), s = this.zones[this.selected];
      if (s?.form.art === "vieleck") {
        const i = s.form.punkte.findIndex((r) => this.near(e, r));
        if (i >= 0) {
          this.remember(), this.deleteVertex(this.selected, i);
          return;
        }
      }
      const n = this.umriss.findIndex((i) => this.near(e, i));
      n >= 0 && this.deleteWallCorner(n);
    };
  }
  set hass(t) {
    const e = !this._hass;
    this._hass = t, e && this.load();
  }
  get hass() {
    return this._hass;
  }
  // -- Laden, Live, Speichern ------------------------------------------
  async load() {
    if (this._hass)
      try {
        const t = await this._hass.callWS({ type: `${P}/rooms/get` });
        this.data = t, this.error = "";
        const e = t.raeume.some((s) => s.id === this.raumId);
        this.page === "haus" && t.raeume.length ? (this.raumId = e ? this.raumId : t.raeume[0].id, this.openHaus(!0)) : this.selectRoom(e ? this.raumId : t.raeume[0]?.id ?? "", !0);
      } catch (t) {
        this.error = `Laden fehlgeschlagen: ${t.message ?? t}`;
      }
  }
  /** Nur Admins dürfen ändern; alle anderen sehen nur zu. */
  get kannAendern() {
    return this.data?.darf_aendern !== !1;
  }
  get raum() {
    return this.data?.raeume.find((t) => t.id === this.raumId);
  }
  selectRoom(t, e = !1) {
    if (!e && t === this.raumId && this.page === "raum" || !e && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const s = t !== this.raumId || this.page !== "raum";
    this.page === "haus" && this.unsubscribeHaus(), this.page = "raum", this.raumId = t;
    const n = this.raum;
    if (this.zones = n ? structuredClone(n.zonen) : [], this.umriss = n ? structuredClone(n.umriss) : [], this.oeffnungen = n ? structuredClone(n.oeffnungen ?? []) : [], this.selOpening = -1, this.selVertex = -1, n) {
      const i = n.sensor;
      this.sensor = { x: i.x, y: i.y, winkel: i.winkel, reichweite_cm: i.reichweite_cm, oeffnung_grad: i.oeffnung_grad }, this.aufnahme = n.aufnahme ?? !0, this.aufnahmeTage = n.aufnahme_tage ?? 30;
    }
    this.selected = -1, this.sensorOpen = !1, this.draft = [], this.tool = "auswahl", this.dirty = !1, this.history.clear(), s && (this.viewTouched = !1, this.fit()), this.subscribeLive(), this.loadHeat();
  }
  async subscribeLive() {
    if (!(!this._hass || this.liveRoom === this.raumId) && (await this.unsubscribeLive(), !!this.raumId)) {
      this.liveRoom = this.raumId;
      try {
        this.unsubLive = await this._hass.connection.subscribeMessage((t) => {
          t.raum_id === this.raumId && (this.live = t);
        }, { type: `${P}/live/subscribe`, raum_id: this.raumId });
      } catch {
        this.liveRoom = "", this.live = void 0;
      }
    }
  }
  async unsubscribeLive() {
    const t = this.unsubLive;
    if (this.unsubLive = void 0, this.liveRoom = "", t)
      try {
        await t();
      } catch {
      }
  }
  async loadHeat() {
    if (window.clearInterval(this.heatTimer), this.heat = void 0, !this._hass || !this.heatMin || !this.raumId) return;
    const t = async () => {
      try {
        this.heat = await this._hass.callWS({ type: `${P}/heat/get`, raum_id: this.raumId, minuten: this.heatMin });
      } catch {
        this.heat = void 0;
      }
    };
    await t(), this.heatTimer = window.setInterval(t, 3e4);
  }
  async save() {
    if (!this._hass || !this.raum || !this.kannAendern) return;
    const t = Xt(this.zones);
    if (t) {
      this.showToast(t);
      return;
    }
    this.saving = !0, this.error = "";
    try {
      await this._hass.callWS({
        type: `${P}/room/save`,
        raum_id: this.raumId,
        zonen: this.zones,
        sensor: this.sensor,
        umriss: this.umriss,
        oeffnungen: ss(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage
      }), this.dirty = !1, this.showToast("Gespeichert."), await this.unsubscribeLive(), await new Promise((e) => window.setTimeout(e, 1500)), await this.load();
    } catch (e) {
      this.showToast(`Nicht gespeichert: ${e.message ?? e}`);
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
        const t = await this._hass.callWS({
          type: `${P}/converter_zones/get`,
          raum_id: this.raumId
        });
        if (!t.zonen.length) {
          this.showToast("Im Konverter sind keine Software-Zonen eingerichtet.");
          return;
        }
        this.remember();
        const e = this.zones.slice();
        for (const s of t.zonen) e.push(Yt(s, e, this.data.vorlagen));
        this.zones = e, this.dirty = !0, this.showToast(`${t.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
      } catch (t) {
        this.showToast(`Konverter-Zonen nicht lesbar: ${t.message ?? t}`);
      }
  }
  // -- Hausplan -------------------------------------------------------------
  outlineOf(t) {
    return Bt(
      t.umriss,
      t.zonen.map((e) => e.form),
      [t.sensor.x, t.sensor.y]
    );
  }
  openHaus(t = !1) {
    if (!this.data || !t && this.page === "haus" || !t && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const e = this.data.raeume;
    this.lagen = Ft(
      e.map((i) => ({
        id: i.id,
        outline: this.outlineOf(i),
        lage: i.haus_gesetzt ? { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel } : null
      }))
    );
    const s = {};
    for (const i of e) for (const r of i.zonen) r.art === "ausgang" && r.id && (s[`${i.id}/${r.id}`] = r.fuehrt_zu ?? "");
    this.tueren = s;
    const n = this.page === "haus";
    this.page = "haus", this.hausSel = "", this.tool = "auswahl", this.dirty = !1, this.unsubscribeLive(), this.subscribeHaus(), n || (this.viewTouched = !1, this.fit());
  }
  async subscribeHaus() {
    if (await this.unsubscribeHaus(), !(!this._hass || !this.data))
      for (const t of this.data.raeume)
        try {
          const e = await this._hass.connection.subscribeMessage((s) => {
            this.hausLive = { ...this.hausLive, [s.raum_id]: s };
          }, { type: `${P}/live/subscribe`, raum_id: t.id });
          this.hausUnsubs.push(e);
        } catch {
        }
  }
  async unsubscribeHaus() {
    const t = this.hausUnsubs;
    this.hausUnsubs = [], this.hausLive = {};
    for (const e of t)
      try {
        await e();
      } catch {
      }
  }
  turnRoom(t, e) {
    const s = this.lagen[t];
    if (!s) return;
    let n = ((s.winkel + e) % 360 + 540) % 360 - 180;
    n === -180 && (n = 180), this.lagen = { ...this.lagen, [t]: { ...s, winkel: n } }, this.dirty = !0;
  }
  async saveHaus() {
    if (!(!this._hass || !this.data || !this.kannAendern)) {
      this.saving = !0;
      try {
        const t = Object.entries(this.tueren).filter(([e, s]) => {
          const [n, i] = e.split("/");
          return (this.data.raeume.find((o) => o.id === n)?.zonen.find((o) => o.id === i)?.fuehrt_zu ?? "") !== s;
        }).map(([e, s]) => {
          const [n, i] = e.split("/");
          return { raum_id: n, zone_id: i, fuehrt_zu: s || null };
        });
        await this._hass.callWS({
          type: `${P}/haus/save`,
          raeume: Object.entries(this.lagen).map(([e, s]) => ({ raum_id: e, x: Math.round(s.x), y: Math.round(s.y), winkel: s.winkel })),
          tueren: t
        }), this.dirty = !1, this.showToast("Hausplan gespeichert."), await this.unsubscribeHaus(), await new Promise((e) => window.setTimeout(e, 1500)), await this.load();
      } catch (t) {
        this.showToast(`Nicht gespeichert: ${t.message ?? t}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  showToast(t) {
    this.toast = t, window.clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => this.toast = "", 4e3);
  }
  // -- Lebenszyklus --------------------------------------------------------
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("keydown", this.onKey), this._hass && this.page === "haus" ? this.subscribeHaus() : this._hass && this.raumId && this.subscribeLive();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this.onKey), window.clearInterval(this.heatTimer), this.resize?.disconnect(), this.resize = void 0, this.unsubscribeLive(), this.unsubscribeHaus();
  }
  updated(t) {
    super.updated(t);
    const e = this.renderRoot.querySelector(".stage");
    e && !this.resize && (this.resize = new ResizeObserver((s) => {
      const n = s[0].contentRect;
      !n.width || !n.height || n.width === this.size.w && n.height === this.size.h || (this.size = { w: n.width, h: n.height }, this.viewTouched || this.fit());
    }), this.resize.observe(e));
  }
  // -- Umrechnung Bildschirm ↔ Raum ----------------------------------------
  toScreen([t, e]) {
    const { cx: s, cy: n, scale: i } = this.view;
    return [this.size.w / 2 + (t - s) * i, this.size.h / 2 - (e - n) * i];
  }
  screenPoints(t) {
    return ls(t.map((e) => this.toScreen(e)));
  }
  toWorld(t) {
    const s = this.renderRoot.querySelector("svg.plan")?.getBoundingClientRect() ?? { left: 0, top: 0 }, { cx: n, cy: i, scale: r } = this.view;
    return [n + (t.clientX - s.left - this.size.w / 2) / r, i - (t.clientY - s.top - this.size.h / 2) / r];
  }
  snapped(t) {
    return Dt(t, os);
  }
  px(t) {
    return t * this.view.scale;
  }
  zoom(t, e) {
    this.viewTouched = !0;
    const { cx: s, cy: n, scale: i } = this.view, r = Math.max(0.05, Math.min(8, i * t));
    if (!e) {
      this.view = { cx: s, cy: n, scale: r };
      return;
    }
    const o = i / r;
    this.view = { cx: e[0] - (e[0] - s) * o, cy: e[1] - (e[1] - n) * o, scale: r };
  }
  // -- Bearbeiten ------------------------------------------------------------
  remember() {
    this.history.push({ zones: this.zones, sensor: this.sensor, umriss: this.umriss, oeffnungen: this.oeffnungen });
  }
  updateZone(t, e) {
    const s = this.zones.slice();
    s[t] = { ...s[t], ...e }, this.zones = s, this.dirty = !0;
  }
  updateRegel(t, e) {
    this.remember(), this.updateZone(t, { regel: { ...this.zones[t].regel, ...e } });
  }
  setRolle(t, e) {
    if (!this.data) return;
    this.remember();
    const s = this.zones.slice();
    s[t] = Jt(s[t], e, this.data.vorlagen), this.zones = s, this.dirty = !0;
  }
  addZone(t) {
    this.data && (this.remember(), this.zones = [...this.zones, Kt(t, this.zones, this.data.vorlagen)], this.select(this.zones.length - 1), this.dirty = !0);
  }
  deleteZone(t) {
    if (t < 0) return;
    const e = this.zones[t]?.name ?? "Zone";
    confirm(`Zone „${e}“ löschen? Bis zum Speichern lässt sich das mit „Rückgängig“ zurückholen.`) && (this.remember(), this.zones = this.zones.filter((s, n) => n !== t), this.selected = -1, this.dirty = !0);
  }
  select(t) {
    t !== this.selected && (this.selVertex = -1), this.selected = t, t >= 0 && (this.selOpening = -1), t >= 0 && (this.sensorOpen = !1, this.tab = "zonen");
  }
  setTool(t) {
    this.tool = t, this.draft = [], this.rectDraft = null, this.layersOpen = !1, t !== "auswahl" && t !== "zellen" && (this.selected = -1);
  }
  // -- Zeiger ------------------------------------------------------------------
  sensorHandle() {
    const [t, e] = at(this.sensor.winkel), s = 46 / this.view.scale;
    return [this.sensor.x + t * s, this.sensor.y + e * s];
  }
  near(t, e, s = _) {
    return pe(this.toScreen(t), this.toScreen(e)) <= s;
  }
  zoneAt(t) {
    for (let e = this.zones.length - 1; e >= 0; e--) if (Le(t, this.zones[e].form)) return e;
    return -1;
  }
  onPointerDown(t) {
    if (t.button === 2) return;
    this.layersOpen = !1;
    const e = t.currentTarget, s = this.toWorld(t), n = this.snapped(s);
    if (e.setPointerCapture(t.pointerId), this.page === "haus") {
      const a = this.hausRoomAt(s);
      this.hausSel = a, a && this.kannAendern ? this.drag = { kind: "haus-raum", id: a, last: s } : this.drag = { kind: "pan", start: [t.clientX, t.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }
    if (!this.kannAendern) {
      const a = this.zoneAt(s);
      this.select(a), a < 0 && (this.sensorOpen = !1, this.drag = { kind: "pan", start: [t.clientX, t.clientY], view: { cx: this.view.cx, cy: this.view.cy } });
      return;
    }
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft.length >= 3 && this.near(s, this.draft[0]) ? this.finishDraft() : this.draft = [...this.draft, n];
      return;
    }
    if (this.tool === "oeffnung") {
      const a = this.wallAt(s, _ * 2);
      if (a < 0) {
        this.showToast(this.umriss.length >= 3 ? "Bitte direkt auf einer Wand beginnen." : "Zuerst die Wände zeichnen.");
        return;
      }
      this.drag = { kind: "opening", kante: a, start: s }, this.openingDraft = null;
      return;
    }
    if (this.tool === "rechteck") {
      this.drag = { kind: "rect", start: n }, this.rectDraft = [n, n];
      return;
    }
    if (this.tool === "zellen") {
      let a = this.selected;
      a < 0 || this.zones[a].form.art !== "zellen" ? (this.addZone({ art: "zellen", groesse: Ct, zellen: [] }), a = this.zones.length - 1) : this.remember();
      const l = this.zones[a].form, [h, p] = ze(s, l.groesse, l.x0 ?? 0, l.y0 ?? 0), u = !l.zellen.some(([x, f]) => x === h && f === p);
      this.drag = { kind: "paint", add: u }, this.updateZone(a, { form: We(l, s, u) });
      return;
    }
    const i = this.zones[this.selected];
    if (i && i.form.art !== "zellen" && this.near(s, this.zoneRotateHandle(i.form))) {
      this.remember();
      const a = z(i.form);
      this.drag = { kind: "rotate-zone", center: a, start: ce(a, s), anchor: i.form };
      return;
    }
    if (i?.form.art === "vieleck") {
      const a = i.form.punkte.findIndex((h) => this.near(s, h));
      if (a >= 0) {
        if (this.remember(), t.altKey) {
          this.deleteVertex(this.selected, a);
          return;
        }
        this.selVertex = a, this.drag = { kind: "vertex", index: a };
        return;
      }
      const l = D(i.form.punkte).findIndex((h) => this.near(s, h));
      if (l >= 0) {
        this.remember(), this.updateZone(this.selected, { form: je(i.form, l, this.snapped(D(i.form.punkte)[l])) }), this.selVertex = l + 1, this.drag = { kind: "vertex", index: l + 1 };
        return;
      }
    } else if (i?.form.art === "rechteck") {
      const a = i.form, l = se(a.mitte, a.breite, a.tiefe, a.winkel).findIndex((h) => this.near(s, h));
      if (l >= 0) {
        this.remember(), this.drag = { kind: "corner", index: l };
        return;
      }
    }
    if (this.near(s, this.sensorHandle(), _ + 2)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor-rotate" }, this.openSensor();
      return;
    }
    if (this.near(s, [this.sensor.x, this.sensor.y], _ + 4)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor" }, this.openSensor();
      return;
    }
    const r = this.zoneAt(s);
    if (r >= 0) {
      this.select(r), this.remember(), this.drag = { kind: "zone", last: n };
      return;
    }
    const o = this.umriss.findIndex((a) => this.near(s, a));
    if (o >= 0) {
      this.remember(), this.drag = { kind: "umriss-vertex", index: o };
      return;
    }
    if (this.umriss.length >= 3) {
      const a = D(this.umriss).findIndex((h) => this.near(s, h));
      if (a >= 0) {
        this.remember();
        const h = this.umriss.slice();
        h.splice(a + 1, 0, this.snapped(D(this.umriss)[a])), this.oeffnungen = Ye(this.oeffnungen, { inserted: a }, this.umriss.length), this.umriss = h, this.dirty = !0, this.drag = { kind: "umriss-vertex", index: a + 1 };
        return;
      }
      const l = this.openingAt(s);
      if (l >= 0) {
        this.selected = -1, this.selOpening = l, this.sensorOpen = !1, this.tab = "raum";
        return;
      }
    }
    this.selected = -1, this.selOpening = -1, this.sensorOpen = !1, this.drag = { kind: "pan", start: [t.clientX, t.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
  }
  deleteVertex(t, e) {
    const s = this.zones[t];
    if (s?.form.art === "vieleck") {
      if (s.form.punkte.length <= 3) {
        this.showToast("Eine Fläche braucht mindestens drei Punkte.");
        return;
      }
      this.remember(), this.updateZone(t, { form: Gt(s.form, e) }), this.selVertex = -1;
    }
  }
  deleteWallCorner(t) {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember(), this.oeffnungen = Ye(this.oeffnungen, { removed: t }, this.umriss.length), this.umriss = this.umriss.filter((e, s) => s !== t), this.selOpening = -1, this.dirty = !0;
  }
  changeOpening(t, e) {
    this.remember(), this.oeffnungen = this.oeffnungen.map((s, n) => n === t ? { ...s, ...e } : s), this.dirty = !0;
  }
  deleteOpening(t) {
    confirm("Diese Öffnung in der Wand löschen?") && (this.remember(), this.oeffnungen = this.oeffnungen.filter((e, s) => s !== t), this.selOpening = -1, this.dirty = !0);
  }
  turnZone(t, e) {
    const s = this.zones[t];
    !s || s.form.art === "zellen" || (this.remember(), this.updateZone(t, { form: qe(s.form, z(s.form), e) }));
  }
  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  wallAt(t, e = _) {
    const s = this.umriss.length;
    if (s < 3) return -1;
    let n = -1, i = e;
    for (let r = 0; r < s; r++) {
      const o = de(this.toScreen(t), this.toScreen(this.umriss[r]), this.toScreen(this.umriss[(r + 1) % s]));
      o <= i && (n = r, i = o);
    }
    return n;
  }
  openingAt(t) {
    return this.oeffnungen.findIndex((e) => {
      const [s, n] = Xe(this.umriss, e);
      return de(this.toScreen(t), this.toScreen(s), this.toScreen(n)) <= _;
    });
  }
  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  zoneRotateHandle(t) {
    const e = z(t), s = Math.max(...Z(t).map((n) => n[1]));
    return [e[0], s + 36 / this.view.scale];
  }
  openSensor() {
    this.selected = -1, this.sensorOpen = !0, this.tab = "raum";
  }
  onPointerMove(t) {
    const e = this.toWorld(t), s = this.snapped(e);
    this.hover = s;
    const n = this.drag;
    if (!n) return;
    const i = this.zones[this.selected];
    switch (n.kind) {
      case "pan": {
        this.viewTouched = !0;
        const r = (t.clientX - n.start[0]) / this.view.scale, o = (t.clientY - n.start[1]) / this.view.scale;
        this.view = { ...this.view, cx: n.view.cx - r, cy: n.view.cy + o };
        break;
      }
      case "vertex":
        i && this.updateZone(this.selected, { form: qt(i.form, n.index, s) });
        break;
      case "corner":
        i?.form.art === "rechteck" && this.updateZone(this.selected, { form: Qt(i.form, n.index, s) });
        break;
      case "umriss-vertex": {
        const r = this.umriss.slice();
        r[n.index] = s, this.umriss = r, this.dirty = !0;
        break;
      }
      case "zone": {
        if (!i) break;
        const r = s[0] - n.last[0], o = s[1] - n.last[1];
        if (i.form.art === "zellen") {
          const a = i.form.groesse, l = Math.round(r / a), h = Math.round(o / a);
          if (!l && !h) break;
          this.updateZone(this.selected, { form: ge(i.form, l * a, h * a) }), this.drag = { kind: "zone", last: [n.last[0] + l * a, n.last[1] + h * a] };
        } else (r || o) && (this.updateZone(this.selected, { form: ge(i.form, r, o) }), this.drag = { kind: "zone", last: s });
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: s[0], y: s[1] });
        break;
      case "sensor-rotate": {
        let r = ce([this.sensor.x, this.sensor.y], e);
        t.shiftKey || (r = Math.round(r / 5) * 5), r <= -180 && (r += 360), this.moveSensor({ ...this.sensor, winkel: r });
        break;
      }
      case "paint":
        i?.form.art === "zellen" && this.updateZone(this.selected, { form: We(i.form, e, n.add) });
        break;
      case "rect":
        this.rectDraft = [n.start, s];
        break;
      case "opening": {
        this.openingDraft = ts(this.umriss, n.kante, n.start, e);
        break;
      }
      case "rotate-zone": {
        let r = ce(n.center, e) - n.start;
        t.shiftKey || (r = Math.round(r / 5) * 5), this.updateZone(this.selected, { form: qe(n.anchor, n.center, r) });
        break;
      }
      case "haus-raum": {
        const r = Math.round((e[0] - n.last[0]) / 10) * 10, o = Math.round((e[1] - n.last[1]) / 10) * 10;
        if (!r && !o) break;
        const a = this.lagen[n.id];
        this.lagen = { ...this.lagen, [n.id]: { ...a, x: a.x + r, y: a.y + o } }, this.drag = { ...n, last: [n.last[0] + r, n.last[1] + o] }, this.dirty = !0;
        break;
      }
    }
  }
  moveSensor(t) {
    this.sensor = t;
    const e = this.sensorAnchor;
    this.zonesFollow && e && (this.zones = e.zones.map((s) => ({ ...s, form: Wt(s.form, e.sensor, t) }))), this.dirty = !0;
  }
  onPointerUp() {
    const t = this.drag;
    if (this.drag = null, this.sensorAnchor = null, t?.kind === "opening") {
      const e = this.openingDraft;
      this.openingDraft = null, e ? (this.remember(), this.oeffnungen = [...this.oeffnungen, e], this.selOpening = this.oeffnungen.length - 1, this.selected = -1, this.tab = "raum", this.dirty = !0, this.tool = "auswahl") : this.showToast("Etwas weiter an der Wand entlang ziehen (mindestens 20 cm).");
      return;
    }
    if (t?.kind === "rect" && this.rectDraft) {
      const [e, s] = this.rectDraft;
      this.rectDraft = null, Math.abs(e[0] - s[0]) >= 10 && Math.abs(e[1] - s[1]) >= 10 && (this.addZone(Be(e, s)), this.tool = "auswahl");
    }
  }
  onDoubleClick(t) {
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft = this.draft.slice(0, -1), this.finishDraft();
      return;
    }
    const e = this.zones[this.selected];
    if (this.tool !== "auswahl" || e?.form.art !== "vieleck") return;
    const s = this.toWorld(t), n = e.form.punkte;
    for (let i = 0; i < n.length; i++)
      if (de(this.toScreen(s), this.toScreen(n[i]), this.toScreen(n[(i + 1) % n.length])) <= _) {
        this.remember(), this.updateZone(this.selected, { form: je(e.form, i, this.snapped(s)) });
        return;
      }
  }
  onWheel(t) {
    t.preventDefault(), this.zoom(t.deltaY < 0 ? 1.15 : 1 / 1.15, this.toWorld(t));
  }
  // -- Plan zeichnen -------------------------------------------------------------
  renderGrid() {
    const { w: t, h: e } = this.size, s = this.view.scale, n = this.view.cx - t / 2 / s, i = this.view.cx + t / 2 / s, r = this.view.cy - e / 2 / s, o = this.view.cy + e / 2 / s, a = s > 0.6 ? 50 : s > 0.2 ? 100 : 500, l = [];
    for (let h = Math.floor(n / a) * a; h <= i; h += a) {
      const [p] = this.toScreen([h, 0]);
      l.push(g`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1=${p} y1="0" x2=${p} y2=${e} />`);
    }
    for (let h = Math.floor(r / a) * a; h <= o; h += a) {
      const [, p] = this.toScreen([0, h]);
      l.push(g`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1="0" y1=${p} x2=${t} y2=${p} />`);
    }
    return g`<g>${l}</g>`;
  }
  renderRoom() {
    if (this.umriss.length < 3) return d;
    const t = this.screenPoints(this.umriss), e = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen, s = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen, n = z({ art: "vieleck", punkte: this.umriss });
    return g`<polygon class="floor" points=${t} />
      <polygon class="wall" points=${t} />
      ${s.map((i, r) => this.renderOpening(i, r === this.selOpening || i === this.openingDraft, n))}
      ${e ? g`${this.umriss.map((i) => {
      const [r, o] = this.toScreen(i);
      return g`<circle class="handle" cx=${r} cy=${o} r="5" />`;
    })}
          ${D(this.umriss).map((i) => this.renderPlus(i))}` : d}`;
  }
  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  renderOpening(t, e, s) {
    const [n, i] = Xe(this.umriss, t), [r, o] = this.toScreen(n), [a, l] = this.toScreen(i), h = g`<line class="wall-gap" x1=${r} y1=${o} x2=${a} y2=${l} />`;
    if (t.art === "offen")
      return g`<g class="opening ${e ? "selected" : ""}">${h}<line class="opening-line" x1=${r} y1=${o} x2=${a} y2=${l} /></g>`;
    const [p, u, x, f] = t.anschlag === "ende" ? [a, l, r, o] : [r, o, a, l], v = Math.hypot(x - p, f - u) || 1;
    let y = -(f - u) / v, w = (x - p) / v;
    const [M, H] = this.toScreen(s);
    (M - p) * y + (H - u) * w >= 0 !== (t.aufgehen !== "aussen") && (y = -y, w = -w);
    const C = p + y * v, k = u + w * v, Y = (x - p) * w - (f - u) * y > 0 ? 0 : 1;
    return g`<g class="opening ${e ? "selected" : ""}">${h}
      <line class="door-leaf" x1=${p} y1=${u} x2=${C} y2=${k} />
      <path class="door-arc" d="M ${C} ${k} A ${v} ${v} 0 0 ${Y} ${x} ${f}" /></g>`;
  }
  /** Kleines „+“: hier einen Punkt einfügen. */
  renderPlus(t) {
    const [e, s] = this.toScreen(t);
    return g`<g class="plus"><circle cx=${e} cy=${s} r="6" /><path d="M ${e - 3} ${s} H ${e + 3} M ${e} ${s - 3} V ${s + 3}" /></g>`;
  }
  renderHeat() {
    if (!this.heat?.zellen.length) return d;
    const t = Math.max(...this.heat.zellen.map((s) => s[2])), e = this.heat.zelle_cm;
    return g`<g>${this.heat.zellen.map(([s, n, i]) => {
      const [r, o] = this.toScreen([s * e, (n + 1) * e]), a = Math.min(0.8, 0.12 + Math.log1p(i) / Math.log1p(t));
      return g`<rect x=${r} y=${o} width=${this.px(e) + 0.5} height=${this.px(e) + 0.5} fill="rgba(var(--rz-heat), ${a.toFixed(2)})" />`;
    })}</g>`;
  }
  renderCoverage() {
    if (!this.layers.abdeckung) return d;
    const t = this.sensor;
    return g`<polygon class="coverage" points=${this.screenPoints(Ue([t.x, t.y], t.winkel, t.reichweite_cm, t.oeffnung_grad))} />`;
  }
  renderZone(t, e) {
    const s = (t.id ? this.live?.zonen[t.id]?.belegt : !1) ?? !1, n = Q(t), i = ee(n), r = e === this.selected, o = s ? 0.5 : 0.2;
    let a;
    if (t.form.art === "zellen")
      a = g`${we(t.form).map((l) => {
        const [h, p] = this.toScreen([l.x, l.y + l.s]);
        return g`<rect class="zone-shape ${r ? "selected" : ""}" x=${h} y=${p} width=${this.px(l.s)} height=${this.px(l.s)} fill=${i} fill-opacity=${o} stroke=${i} style="stroke-width:1" />`;
      })}`;
    else {
      const l = this.screenPoints(Z(t.form)), h = r && t.regel.rand_cm > 0 ? this.px(t.regel.rand_cm * 2) : 0;
      a = g`
        ${h ? g`<mask id="rz-band-${e}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${l} fill="black" />
              </mask>
              <polygon points=${l} fill="none" stroke=${i} stroke-opacity="0.25" stroke-width=${h} stroke-linejoin="round" mask="url(#rz-band-${e})" />` : d}
        <polygon class="zone-shape ${r ? "selected" : ""}" points=${l} fill=${i} fill-opacity=${o} stroke=${i} />`;
    }
    return g`<g>${a}</g>`;
  }
  /** Beschriftung der Zone; wird nach den Figuren gezeichnet, damit sie lesbar bleibt. */
  renderZoneLabel(t) {
    const e = t.id ? this.live?.zonen[t.id] : void 0, [s, n] = this.toScreen(z(t.form)), i = e ? e.belegt ? `belegt${e.personen > 1 ? ` · ${e.personen}` : ""}` : "frei" : "neu";
    return g`<text class="label" x=${s} y=${n - 2}>${t.name}</text>
      <text class="label sub" x=${s} y=${n + 14}>${i}</text>`;
  }
  renderHandles() {
    const t = this.zones[this.selected];
    if (!t || this.tool !== "auswahl" || !this.kannAendern) return d;
    let e = [];
    t.form.art === "vieleck" ? e = t.form.punkte : t.form.art === "rechteck" && (e = se(t.form.mitte, t.form.breite, t.form.tiefe, t.form.winkel));
    let s = d;
    if (t.form.art !== "zellen") {
      const [n, i] = this.toScreen(z(t.form)), [r, o] = this.toScreen(this.zoneRotateHandle(t.form));
      s = g`<line class="sensor-line" x1=${n} y1=${i} x2=${r} y2=${o} /><circle class="handle angle" cx=${r} cy=${o} r="8"><title>Drehen</title></circle>`;
    }
    return g`${s}
      ${t.form.art === "vieleck" ? D(t.form.punkte).map((n) => this.renderPlus(n)) : d}
      ${e.map((n, i) => {
      const [r, o] = this.toScreen(n), a = t.form.art === "vieleck" && i === this.selVertex;
      return g`<rect class="handle ${a ? "on" : ""}" x=${r - 5} y=${o - 5} width="10" height="10" rx="2" />`;
    })}`;
  }
  renderSensor() {
    const t = this.sensor, [e, s] = this.toScreen([t.x, t.y]), [n, i] = this.toScreen(this.sensorHandle()), r = -t.winkel * Math.PI / 180, o = [4.5, 7.5].map((a) => {
      const l = r - Math.PI / 2 - 0.7, h = r - Math.PI / 2 + 0.7;
      return g`<path class="sensor-wave" d="M ${e + a * Math.cos(l)} ${s + a * Math.sin(l)} A ${a} ${a} 0 0 1 ${e + a * Math.cos(h)} ${s + a * Math.sin(h)}" />`;
    });
    return g`<g>
      ${this.kannAendern ? g`<line class="sensor-line" x1=${e} y1=${s} x2=${n} y2=${i} />
            <circle class="handle angle" cx=${n} cy=${i} r="8" />` : d}
      <circle class="sensor-body" cx=${e} cy=${s} r="12" />
      ${o}
    </g>`;
  }
  renderLive() {
    const t = this.live;
    if (!t) return d;
    const e = [];
    if (this.layers.ziele)
      for (const [, s, n] of t.ziele) {
        const [i, r] = this.toScreen([s, n]);
        e.push(g`<path class="target" d="M${i - 4} ${r - 4} L${i + 4} ${r + 4} M${i - 4} ${r + 4} L${i + 4} ${r - 4}" />`);
      }
    for (const s of t.figuren) {
      if (s.tags.includes("wiederhergestellt") || s.tags.includes("stoerung")) continue;
      const n = s.tags.includes("hund") || s.art === "pet", i = n ? "var(--rz-tier)" : "var(--rz-person)";
      if (this.layers.spuren && s.spur.length > 1 && e.push(g`<polyline class="trail" points=${this.screenPoints(s.spur)} stroke=${i} />`), !this.layers.figuren) continue;
      const [r, o] = this.toScreen([s.x, s.y]), a = Math.max(7, this.px(14));
      e.push(g`<circle class="figure ${s.gehalten ? "held" : ""}" cx=${r} cy=${o} r=${a} fill=${i} stroke=${s.gehalten ? i : "var(--card)"} />`), (n || s.gehalten) && e.push(g`<text class="label sub" x=${r} y=${o - a - 5}>${n ? "Hund?" : "gehalten"}</text>`);
    }
    return g`<g>${e}</g>`;
  }
  renderDraft() {
    if (this.rectDraft) {
      const n = Be(...this.rectDraft);
      if (n.art !== "rechteck") return d;
      const [i, r] = this.toScreen(n.mitte);
      return g`<polygon class="draft" points=${this.screenPoints(se(n.mitte, n.breite, n.tiefe, 0))} />
        <text class="label" x=${i} y=${r + 5}>${(n.breite / 100).toFixed(2)} × ${(n.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return d;
    const t = this.hover ? [...this.draft, this.hover] : this.draft, [e, s] = this.toScreen(this.draft[0]);
    return g`<polyline class="draft" points=${this.screenPoints(t)} style="fill:none" />
      ${this.draft.map((n) => {
      const [i, r] = this.toScreen(n);
      return g`<circle class="draft-dot" cx=${i} cy=${r} r="4" />`;
    })}
      ${this.draft.length >= 3 ? g`<circle class="close-ring" cx=${e} cy=${s} r=${_} />` : d}`;
  }
  hausRoomAt(t) {
    const e = this.data?.raeume ?? [];
    for (let s = e.length - 1; s >= 0; s--) {
      const n = e[s], i = this.lagen[n.id];
      if (i && Le(t, { art: "vieleck", punkte: this.outlineOf(n).map((r) => A(r, i)) })) return n.id;
    }
    return "";
  }
  /** Mitte einer Tür im Haus. */
  doorCenter(t, e) {
    const s = this.lagen[t.id];
    return s ? A(z(e.form), s) : null;
  }
  renderHausPlan() {
    const t = this.data?.raeume ?? [], e = [], s = [], n = [], i = [];
    for (const r of t) {
      const o = this.lagen[r.id];
      if (!o) continue;
      const a = this.outlineOf(r).map((f) => A(f, o)), l = r.id === this.hausSel, h = this.hausLive[r.id];
      e.push(g`<polygon class="floor" points=${this.screenPoints(a)} />
        <polygon class="wall ${r.umriss.length >= 3 ? "" : "guess"} ${l ? "selected" : ""}" points=${this.screenPoints(a)} />`);
      for (const f of r.zonen) {
        const v = Q(f);
        if (v === "ignorieren") continue;
        const y = (f.id ? h?.zonen[f.id]?.belegt : !1) ?? !1, w = Z(f.form).map((k) => A(k, o));
        if (e.push(g`<polygon class="zone-shape" points=${this.screenPoints(w)} fill=${ee(v)} fill-opacity=${y ? 0.5 : 0.18} stroke=${ee(v)} />`), f.art !== "ausgang" || !f.id) continue;
        const M = this.tueren[`${r.id}/${f.id}`] ?? "", H = this.doorCenter(r, f);
        if (!H) continue;
        const [X, C] = this.toScreen(H);
        if (M === "aussen")
          n.push(g`<text class="label sub" x=${X} y=${C - 10}>nach draußen</text>`);
        else if (M) {
          const k = t.find((j) => j.id === M);
          if (!k || r.id > k.id) continue;
          const Y = k.zonen.find((j) => j.art === "ausgang" && j.id && this.tueren[`${k.id}/${j.id}`] === r.id), _e = this.lagen[k.id], Ae = Y ? this.doorCenter(k, Y) : _e ? A(z({ art: "vieleck", punkte: this.outlineOf(k) }), _e) : null;
          if (!Ae) continue;
          const [Se, Me] = this.toScreen(Ae);
          s.push(g`<line class="link" x1=${X} y1=${C} x2=${Se} y2=${Me} />
            <circle class="link-dot" cx=${X} cy=${C} r="5" /><circle class="link-dot" cx=${Se} cy=${Me} r="5" />`);
        }
      }
      const [p, u] = this.toScreen(z({ art: "vieleck", punkte: a })), x = h ? h.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
      n.push(g`<text class="label room" x=${p} y=${u}>${r.name}</text>
        <text class="label sub" x=${p} y=${u + 16}>${h ? x ? `${x} ${x === 1 ? "Person" : "Personen"}` : "niemand" : "nicht erreichbar"}</text>`);
      for (const f of h?.figuren ?? []) {
        if (f.tags.includes("wiederhergestellt") || f.tags.includes("stoerung")) continue;
        const y = f.tags.includes("hund") || f.art === "pet" ? "var(--rz-tier)" : "var(--rz-person)", [w, M] = this.toScreen(A([f.x, f.y], o)), H = Math.max(6, this.px(14));
        i.push(g`<circle class="figure ${f.gehalten ? "held" : ""}" cx=${w} cy=${M} r=${H} fill=${y} stroke=${f.gehalten ? y : "var(--card)"} />`);
      }
    }
    return g`${e}${s}${i}${n}`;
  }
  renderScalebar() {
    const t = hs(90 / this.view.scale), e = t >= 100 ? `${t / 100} m` : `${t} cm`;
    return c`<div class="scalebar"><div style="width:${this.px(t)}px"></div>${e}</div>`;
  }
  renderBubble() {
    const t = as[this.tool];
    if (t) {
      const e = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return c`<div class="bubble">
        <ha-icon icon=${Je.find((s) => s.tool === this.tool).icon}></ha-icon>
        <span class="grow">${t}</span>
        ${e ? c`<button class="text" @click=${this.finishDraft}>Fertig</button>` : d}
        <button class="text" @click=${() => this.setTool("auswahl")}>${this.tool === "zellen" ? "Fertig" : "Abbrechen"}</button>
      </div>`;
    }
    return this.kannAendern && !this.zones.length && this.tool === "auswahl" ? c`<div class="bubble">
        <ha-icon icon="mdi:gesture-tap"></ha-icon>
        <span class="grow">Zuerst den <b>Sensor</b> an seinen Platz ziehen und am gelben Griff drehen. Dann links ein Werkzeug wählen und die erste Zone zeichnen.</span>
      </div>` : d;
  }
  renderLayers() {
    if (!this.layersOpen) return d;
    const t = (s, n) => c`<label class="check"
        ><input
          type="checkbox"
          .checked=${this.layers[s]}
          @change=${(i) => this.layers = { ...this.layers, [s]: i.target.checked }}
        /><span>${n}</span></label
      >`, e = (s, n) => c`<button
        class=${this.heatMin === s ? "active" : ""}
        @click=${() => {
      this.heatMin = s, this.loadHeat();
    }}
      >
        ${n}
      </button>`;
    return c`<div class="layers" @pointerdown=${(s) => s.stopPropagation()}>
      ${t("figuren", "Figuren live")} ${t("spuren", "Spuren der letzten Sekunden")}
      ${t("abdeckung", "Abdeckung des Sensors")} ${t("ziele", "Rohpunkte des Sensors")}
      <div class="label-text">Bewegungskarte: wo war jemand?</div>
      <div class="levels">${e(0, "aus")}${e(15, "15 min")}${e(60, "1 h")}${e(1440, "24 h")}</div>
      <p class="hint small">Zählt seit dem letzten Neustart von Home Assistant.</p>
    </div>`;
  }
  renderStage() {
    const t = this.tool === "zellen" ? "painting" : this.tool === "auswahl" ? "" : "drawing";
    return c`<div class="stage">
      <svg
        class="plan ${t}"
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
        ${this.page === "haus" ? this.renderHausPlan() : g`${this.renderRoom()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((e, s) => this.renderZone(e, s))} ${this.renderLive()}
              ${this.zones.map((e) => this.renderZoneLabel(e))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(e) => e.stopPropagation()}>
        ${this.kannAendern && this.page === "raum" ? c`${Je.map(
      (e) => c`<button class="icon ${this.tool === e.tool ? "on" : ""}" title=${e.label} aria-label=${e.label} @click=${() => this.setTool(e.tool)}>
                  <ha-icon icon=${e.icon}></ha-icon>
                </button>`
    )}
              <span class="sep"></span>` : d}
        ${this.page === "raum" ? c`<button class="icon ${this.layersOpen ? "on" : ""}" title="Ebenen und Bewegungskarte" aria-label="Ebenen" @click=${() => this.layersOpen = !this.layersOpen}>
                <ha-icon icon="mdi:layers-outline"></ha-icon>
              </button>
              <span class="sep"></span>` : d}
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
      ${this.page === "raum" ? c`${this.renderLayers()} ${this.renderBubble()}` : d} ${this.renderScalebar()}
    </div>`;
  }
  // -- Seitenleiste ------------------------------------------------------------
  renderZoneItem(t, e) {
    const s = e === this.selected, n = Q(t), i = ne(n), r = t.id ? this.live?.zonen[t.id] : void 0, o = r ? c`<span class="badge ${r.belegt ? "on" : "off"}">${r.belegt ? r.personen > 1 ? `belegt · ${r.personen}` : "belegt" : "frei"}</span>` : c`<span class="badge new">neu</span>`;
    return c`<li class="item ${s ? "open" : ""}" style="--zone:${ee(n)}">
      <div class="row" @click=${() => this.select(s ? -1 : e)}>
        <span class="dot"></span>
        <ha-icon icon=${i.icon}></ha-icon>
        <span class="name">${t.name}</span>
        ${o}
      </div>
      ${s ? this.renderInspector(t, e) : d}
    </li>`;
  }
  renderInspector(t, e) {
    const s = t.regel, n = Q(t), i = this.data.grenzen, r = (h, p, u, x, f) => c`<label class="field"
        >${p}<input
          type="number"
          min="0"
          max=${x}
          step=${f}
          .value=${String(s[h])}
          @change=${(v) => {
      const y = Number(v.target.value);
      Number.isFinite(y) && this.updateRegel(e, { [h]: Math.max(0, Math.min(x, y)) });
    }}
        /><span class="unit">${u}</span></label
      >`, o = (h, p, u, x) => c`<label class="check"
        ><input type="checkbox" .checked=${u} @change=${(f) => x(f.target.checked)} /><span
          >${h}<small>${p}</small></span
        ></label
      >`, a = fe(t.form), l = (this.data?.raeume ?? []).filter((h) => h.id !== this.raumId);
    return this.kannAendern ? c`<div class="inspector">
      <label class="field"
        >Name<input
          type="text"
          .value=${t.name}
          @change=${(h) => {
      this.remember(), this.updateZone(e, { name: h.target.value });
    }}
      /></label>
      <div class="label-text">Wofür ist die Zone?</div>
      <div class="levels">
        ${me.map(
      (h) => c`<button class=${h.rolle === n ? "active" : ""} @click=${() => this.setRolle(e, h.rolle)}>
            <ha-icon icon=${h.icon}></ha-icon>${h.name}
          </button>`
    )}
      </div>
      <p class="hint small">${ne(n).text}</p>
      ${n === "tuer" ? c`<label class="field"
              >Wohin führt die Tür?<select
                @change=${(h) => {
      this.remember(), this.updateZone(e, { fuehrt_zu: h.target.value });
    }}
              >
                <option value="" ?selected=${!t.fuehrt_zu}>weiß nicht</option>
                <option value="aussen" ?selected=${t.fuehrt_zu === "aussen"}>nach draußen / Raum ohne Sensor</option>
                ${l.map((h) => c`<option value=${h.id} ?selected=${t.fuehrt_zu === h.id}>${h.name}</option>`)}
              </select></label
            >
            <p class="hint small">Damit weiß Raumzonen später, wer von wo nach wo geht.</p>` : d}
      ${n === "bett" ? c`${o(
      "Nur eine Person im Bett",
      "Dann wird ein starrer Punkt, den der Sensor beim Aufstehen zurücklässt, verworfen.",
      s.max_personen === 1,
      (h) => this.updateRegel(e, { max_personen: h ? 1 : 0 })
    )}
          ${o(
      "Hund nicht mitzählen",
      "Nur ein Hinweis; ob es der Hund ist, ergibt sich aus Hundeplätzen oder der Art, die der Sensor meldet.",
      s.hund_ignorieren,
      (h) => this.updateRegel(e, { hund_ignorieren: h })
    )}` : d}
      ${n !== "ignorieren" ? c`<div class="summary">${Ve(t)}</div>
            <details class="fine">
              <summary>Feineinstellung</summary>
              <div class="fields">
                ${r("belegt_nach_s", "Belegt nach", "s", i.belegt_nach_s, 0.5)} ${r("frei_nach_s", "Frei nach", "s", i.frei_nach_s, 0.5)}
              </div>
              ${r("rand_cm", "Randstreifen (gegen Zittern am Rand)", "cm", i.rand_cm, 5)}
              ${s.schlaefer_halten ? c`<p class="hint small">Als „aufgestanden“ gilt erst, wer sich draußen bewegt, weit genug weg ist oder zur Tür geht:</p>
                    <div class="fields">
                      ${r("weg_rahmen", "Bewegte Meldungen", "", i.weg_rahmen, 1)} ${r("weg_cm", "oder Abstand", "cm", i.weg_cm, 5)}
                    </div>` : d}
            </details>` : d}
      ${t.form.art !== "zellen" ? c`<div class="label-text">Form</div>
            <div class="actions">
              <button class="text small" title="Gegen den Uhrzeigersinn" @click=${() => this.turnZone(e, 15)}><ha-icon icon="mdi:rotate-left"></ha-icon>15°</button>
              <button class="text small" title="Im Uhrzeigersinn" @click=${() => this.turnZone(e, -15)}><ha-icon icon="mdi:rotate-right"></ha-icon>15°</button>
              ${t.form.art === "vieleck" ? c`<button class="text small" ?disabled=${this.selVertex < 0 || t.form.punkte.length <= 3} @click=${() => this.deleteVertex(e, this.selVertex)}>
                    <ha-icon icon="mdi:vector-point-minus"></ha-icon>Punkt löschen
                  </button>` : d}
            </div>
            <p class="hint small">
              Am gelben Griff drehen. ${t.form.art === "vieleck" ? "Das „+“ auf einer Kante fügt einen Punkt ein; Rechtsklick auf einen Punkt löscht ihn." : ""}
            </p>` : d}
      ${a ? c`<div class="note warn">${a}</div>` : d}
      <div class="actions">
        <span class="spacer"></span>
        <button class="text danger" @click=${() => this.deleteZone(e)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
      </div>
    </div>` : c`<div class="inspector">
        <p class="hint small">${ne(n).text}</p>
        ${n === "tuer" ? c`<div class="summary">Führt ${Ke(t, l)}.</div>` : d}
        ${n !== "ignorieren" ? c`<div class="summary">${Ve(t)}</div>` : d}
      </div>`;
  }
  renderZonesTab() {
    return c`
      ${this.zones.length ? c`<ul class="list">
            ${this.zones.map((t, e) => this.renderZoneItem(t, e))}
          </ul>` : c`<p class="hint">${this.kannAendern ? "Noch keine Zonen. Mit den Werkzeugen links am Plan zeichnen, z. B. ein Rechteck über das Bett." : "Noch keine Zonen eingezeichnet."}</p>`}
      ${this.kannAendern ? this.renderNewZone() : d}`;
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
  renderRoomTab() {
    const t = this.live, e = !!t && t.verfuegbar && !t.problem, s = t?.letzter_rahmen_vor_s, n = t ? t.figuren.filter((r) => !r.tags.includes("wiederhergestellt") && !r.tags.includes("stoerung")).length : 0, i = (r, o, a, l, h) => c`<label class="field"
        >${o}<input
          type="number"
          min=${l}
          max=${h}
          .value=${String(this.sensor[r])}
          @change=${(p) => {
      const u = Number(p.target.value);
      Number.isFinite(u) && (this.remember(), this.sensor = { ...this.sensor, [r]: Math.max(l, Math.min(h, u)) }, this.dirty = !0);
    }}
        /><span class="unit">${a}</span></label
      >`;
    return c`<h3>Sensor</h3>
      <ul class="list">
        <li class="item ${this.sensorOpen ? "open" : ""}">
          <div class="row" @click=${() => this.sensorOpen = !this.sensorOpen}>
            <span class="marker-icon"><ha-icon icon="mdi:radar"></ha-icon></span>
            <span class="name">Radarsensor<small>${e ? "liefert Daten" : t?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${e ? "on" : "off"}" style="--zone:var(--ok)">${e ? "live" : "nicht erreichbar"}</span>
          </div>
          ${this.sensorOpen ? c`<div class="inspector">
                <dl>
                  <dt>Figuren</dt>
                  <dd>${n}</dd>
                  <dt>Letzte Meldung</dt>
                  <dd>${s == null ? "–" : s < 120 ? `vor ${Math.round(s)} s` : `vor ${Math.round(s / 60)} min`}</dd>
                </dl>
                <p class="hint small">Liegt jemand ruhig, meldet der Sensor oft minutenlang nichts. Das ist normal; Raumzonen hält die Figur.</p>
                ${this.kannAendern ? this.renderSensorEdit(i) : d}
              </div>` : d}
        </li>
      </ul>
      ${this.kannAendern ? this.renderRoomEdit() : d}`;
  }
  renderSensorEdit(t) {
    return c`<label class="check"
                  ><input type="checkbox" .checked=${this.zonesFollow} @change=${(e) => this.zonesFollow = e.target.checked} /><span
                    >Zonen bewegen sich mit dem Sensor<small
                      >Praktisch beim Ausrichten: Zonen aus dem Konverter hängen am Sensor. Ausschalten, wenn die Zonen schon zum Raum passen und
                      nur der Sensor versetzt wird.</small
                    ></span
                  ></label
                >
                <details class="fine">
                  <summary>Abdeckung</summary>
                  <div class="fields">${t("reichweite_cm", "Reichweite", "cm", 50, 1500)} ${t("oeffnung_grad", "Öffnung", "°", 10, 360)}</div>
                  <p class="hint small">Laut Datenblatt des eigenen Geräts. Die Bewegungskarte zeigt, wo er wirklich sieht.</p>
                </details>`;
  }
  renderRoomEdit() {
    return c`<p class="hint small">
        So richtest du den Sensor ein: Den dunklen Punkt im Plan an die Stelle ziehen, an der er hängt, und am gelben Griff
        drehen, bis die Abdeckung in den Raum zeigt. Am besten mit eingeschalteter Bewegungskarte einmal durch den Raum gehen.
      </p>
      <h3>Wände</h3>
      <p class="hint small">
        Der Umriss des Raums dient zur Orientierung. Ecken ziehen; das „+“ in der Mitte einer Wand fügt eine Ecke ein, Rechtsklick
        auf eine Ecke löscht sie.
      </p>
      <div class="actions">
        <button class="text small" @click=${() => this.setTool("umriss")}><ha-icon icon="mdi:wall"></ha-icon>${this.umriss.length ? "Neu zeichnen" : "Wände zeichnen"}</button>
        ${this.umriss.length >= 3 ? c`<button class="text small" @click=${() => this.setTool("oeffnung")}><ha-icon icon="mdi:door"></ha-icon>Tür / Öffnung</button>` : d}
        ${this.umriss.length ? c`<button
              class="text small danger"
              @click=${() => {
      this.remember(), this.umriss = [], this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
    }}
            >
              Entfernen
            </button>` : d}
      </div>
      ${this.oeffnungen.length ? c`<ul class="list">
            ${this.oeffnungen.map(
      (t, e) => c`<li class="item ${e === this.selOpening ? "open" : ""}">
                <div class="row" @click=${() => this.selOpening = e === this.selOpening ? -1 : e}>
                  <ha-icon icon=${t.art === "tuer" ? "mdi:door" : "mdi:door-open"}></ha-icon>
                  <span class="name">${t.art === "tuer" ? "Tür" : "Offen"}<small>${Math.round(t.bis - t.von)} cm breit</small></span>
                </div>
                ${e === this.selOpening ? c`<div class="inspector">
                      <div class="levels">
                        ${["tuer", "offen"].map(
        (s) => c`<button
                            class=${t.art === s ? "active" : ""}
                            @click=${() => {
          this.remember(), this.oeffnungen = this.oeffnungen.map((n, i) => i === e ? { ...n, art: s } : n), this.dirty = !0;
        }}
                          >
                            ${s === "tuer" ? "Tür" : "Offen (ohne Tür)"}
                          </button>`
      )}
                      </div>
                      ${t.art === "tuer" ? c`<div class="actions">
                            <button
                              class="text small"
                              @click=${() => this.changeOpening(e, { anschlag: t.anschlag === "ende" ? "anfang" : "ende" })}
                            >
                              <ha-icon icon="mdi:swap-horizontal"></ha-icon>Anschlag wechseln
                            </button>
                            <button
                              class="text small"
                              @click=${() => this.changeOpening(e, { aufgehen: t.aufgehen === "aussen" ? "innen" : "aussen" })}
                            >
                              <ha-icon icon="mdi:swap-vertical"></ha-icon>${t.aufgehen === "aussen" ? "Nach innen aufgehen" : "Nach außen aufgehen"}
                            </button>
                          </div>` : d}
                      <p class="hint small">
                        Nur zur Anzeige. Damit Raumzonen „betreten“ und „verlassen“ erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor
                        zeichnen.
                      </p>
                      <div class="actions">
                        <span class="spacer"></span>
                        <button class="text danger" @click=${() => this.deleteOpening(e)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
                      </div>
                    </div>` : d}
              </li>`
    )}
          </ul>` : d}
      <h3>Aufnahme</h3>
      <label class="check"
        ><input
          type="checkbox"
          .checked=${this.aufnahme}
          @change=${(t) => {
      this.aufnahme = t.target.checked, this.dirty = !0;
    }}
        /><span
          >Bewegungen aufzeichnen<small
            >Speichert die Punkte des Sensors lokal in Home Assistant (nicht im Recorder), damit Raumzonen Gewohnheiten lernen und Regeln
            geprüft werden können. Nur Admins können sie abrufen.</small
          ></span
        ></label
      >
      ${this.aufnahme ? c`<label class="field"
            >Aufbewahren<input
              type="number"
              min="1"
              max=${this.data?.grenzen.aufnahme_tage ?? 365}
              .value=${String(this.aufnahmeTage)}
              @change=${(t) => {
      const e = Math.round(Number(t.target.value));
      Number.isFinite(e) && (this.aufnahmeTage = Math.max(1, Math.min(this.data?.grenzen.aufnahme_tage ?? 365, e)), this.dirty = !0);
    }}
            /><span class="unit">Tage</span></label
          >` : d}`;
  }
  renderHausSide() {
    const t = this.data?.raeume ?? [], e = t.find((i) => i.id === this.hausSel), s = (i, r, o) => c`<button class="text small" @click=${() => this.turnRoom(e.id, i)}><ha-icon icon=${r}></ha-icon>${o}</button>`, n = (i, r) => {
      const o = `${i.id}/${r.id}`, a = this.tueren[o] ?? "", l = t.filter((h) => h.id !== i.id);
      return this.kannAendern ? c`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <label class="field"
          >${r.name} führt zu<select
            @change=${(h) => {
        this.tueren = { ...this.tueren, [o]: h.target.value }, this.dirty = !0;
      }}
          >
            <option value="" ?selected=${!a}>weiß nicht</option>
            <option value="aussen" ?selected=${a === "aussen"}>draußen / Raum ohne Sensor</option>
            ${l.map((h) => c`<option value=${h.id} ?selected=${a === h.id}>${h.name}</option>`)}
          </select></label
        >
      </li>` : c`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${r.name}: ${Ke({ ...r, fuehrt_zu: a }, l)}</span></li>`;
    };
    return c`<aside class="side">
      <div class="side-body">
        <h3>Hausplan</h3>
        <p class="hint small">
          ${this.kannAendern ? "Räume am Plan an ihren Platz ziehen und hier drehen. Bei jeder Tür eintragen, wohin sie führt; dann sieht Raumzonen, wer von wo nach wo geht." : "So liegen die Räume im Haus. Die Punkte zeigen, wo gerade jemand ist."}
        </p>
        <ul class="list">
          ${t.map((i) => {
      const r = this.hausLive[i.id], o = r ? r.figuren.filter((h) => !h.tags.includes("wiederhergestellt") && !h.tags.includes("stoerung")).length : 0, a = i.id === this.hausSel, l = i.zonen.filter((h) => h.art === "ausgang" && h.id);
      return c`<li class="item ${a ? "open" : ""}">
              <div class="row" @click=${() => this.hausSel = a ? "" : i.id}>
                <span class="marker-icon"><ha-icon icon="mdi:floor-plan"></ha-icon></span>
                <span class="name">${i.name}<small>${i.haus_gesetzt || this.dirty ? "" : "noch nicht eingeordnet"}</small></span>
                <span class="badge ${o ? "on" : "off"}">${r ? o ? `${o}` : "leer" : "nicht erreichbar"}</span>
              </div>
              ${a ? c`<div class="inspector">
                    ${this.kannAendern && e ? c`<div class="label-text">Drehen</div>
                          <div class="actions">
                            ${s(90, "mdi:rotate-left", "90°")} ${s(-90, "mdi:rotate-right", "90°")} ${s(5, "mdi:rotate-left", "5°")}
                            ${s(-5, "mdi:rotate-right", "5°")}
                          </div>` : d}
                    ${l.length ? c`<div class="label-text">Türen</div>
                          <ul class="doors">
                            ${l.map((h) => n(i, h))}
                          </ul>` : c`<p class="hint small">Keine Tür eingezeichnet. Eine Tür zeichnet man im Raum (Rolle „Tür“).</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(i.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>` : d}
            </li>`;
    })}
        </ul>
      </div>
    </aside>`;
  }
  renderSide() {
    return this.page === "haus" ? this.renderHausSide() : c`<aside class="side">
      <div class="tabs" role="tablist">
        <button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => this.tab = "zonen"}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>
        <button class=${this.tab === "raum" ? "active" : ""} role="tab" @click=${() => this.tab = "raum"}><ha-icon icon="mdi:floor-plan"></ha-icon>Sensor und Raum</button>
      </div>
      <div class="side-body">${this.tab === "zonen" ? this.renderZonesTab() : this.renderRoomTab()}</div>
    </aside>`;
  }
  // -- Ganze Seite ------------------------------------------------------------------
  renderHeader() {
    const t = this.live, e = !!t && t.verfuegbar && !t.problem;
    return c`<header>
      <button class="icon menu" title="Menü" @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: !0, composed: !0 }))}>
        <ha-icon icon="mdi:menu"></ha-icon>
      </button>
      <span class="title">Raumzonen</span>
      ${this.data?.raeume.length ? c`<nav class="pages">
            <button class=${this.page === "haus" ? "active" : ""} @click=${() => this.openHaus()}><ha-icon icon="mdi:home-outline"></ha-icon>Haus</button>
            ${this.data.raeume.map(
      (s) => c`<button class=${this.page === "raum" && s.id === this.raumId ? "active" : ""} @click=${() => this.selectRoom(s.id)}>${s.name}</button>`
    )}
          </nav>` : d}
      ${this.raum && this.page === "raum" ? c`<span class="live-chip ${e ? "ok" : "down"}" title=${t?.problem ?? ""}><span class="led"></span><span class="text">${e ? "live" : "nicht erreichbar"}</span></span>` : d}
      <span class="spacer"></span>
      ${this.raum && !this.kannAendern ? c`<span class="badge off" title="Ändern dürfen nur Admins">nur ansehen</span>` : d}
      ${this.raum && this.kannAendern ? c`${this.page === "raum" ? c`<button class="icon" title="Rückgängig (Strg+Z)" ?disabled=${!this.history.size} @click=${this.undo}><ha-icon icon="mdi:undo"></ha-icon></button>` : d}
            <button class="text" ?disabled=${!this.dirty || this.saving} @click=${this.discard}><span class="label">Verwerfen</span><ha-icon icon="mdi:close" style=${this.narrow ? "" : "display:none"}></ha-icon></button>
            <button class="primary" ?disabled=${!this.dirty || this.saving} @click=${() => this.page === "haus" ? this.saveHaus() : this.save()}>
              <ha-icon icon="mdi:content-save-outline"></ha-icon><span class="label">${this.saving ? "Speichert …" : "Speichern"}</span>
            </button>` : d}
    </header>`;
  }
  render() {
    return this.data ? this.data.raeume.length ? c`${this.renderHeader()}
      <div class="layout">${this.renderStage()} ${this.renderSide()}</div>
      ${this.toast ? c`<div class="toast" role="status">${this.toast}</div>` : d}` : c`${this.renderHeader()}
        <div class="empty">
          <ha-icon icon="mdi:floor-plan"></ha-icon>
          <p>
            Noch kein Raum. Einen Raum legst du unter <b>Einstellungen → Geräte &amp; Dienste → Raumzonen → Konfigurieren → Raum
            hinzufügen</b> an. Danach erscheint er hier zum Einzeichnen.
          </p>
        </div>` : c`${this.renderHeader()}<div class="empty">${this.error ? c`<ha-icon icon="mdi:alert-circle-outline"></ha-icon><p>${this.error}</p>` : c`<p>Lädt …</p>`}</div>`;
  }
};
m.styles = ns;
b([
  rt({ type: Boolean, reflect: !0 })
], m.prototype, "narrow", 2);
b([
  $()
], m.prototype, "data", 2);
b([
  $()
], m.prototype, "raumId", 2);
b([
  $()
], m.prototype, "zones", 2);
b([
  $()
], m.prototype, "sensor", 2);
b([
  $()
], m.prototype, "umriss", 2);
b([
  $()
], m.prototype, "oeffnungen", 2);
b([
  $()
], m.prototype, "selVertex", 2);
b([
  $()
], m.prototype, "selOpening", 2);
b([
  $()
], m.prototype, "openingDraft", 2);
b([
  $()
], m.prototype, "selected", 2);
b([
  $()
], m.prototype, "sensorOpen", 2);
b([
  $()
], m.prototype, "tab", 2);
b([
  $()
], m.prototype, "tool", 2);
b([
  $()
], m.prototype, "draft", 2);
b([
  $()
], m.prototype, "rectDraft", 2);
b([
  $()
], m.prototype, "hover", 2);
b([
  $()
], m.prototype, "view", 2);
b([
  $()
], m.prototype, "size", 2);
b([
  $()
], m.prototype, "live", 2);
b([
  $()
], m.prototype, "heat", 2);
b([
  $()
], m.prototype, "heatMin", 2);
b([
  $()
], m.prototype, "layersOpen", 2);
b([
  $()
], m.prototype, "layers", 2);
b([
  $()
], m.prototype, "dirty", 2);
b([
  $()
], m.prototype, "zonesFollow", 2);
b([
  $()
], m.prototype, "saving", 2);
b([
  $()
], m.prototype, "error", 2);
b([
  $()
], m.prototype, "toast", 2);
b([
  $()
], m.prototype, "page", 2);
b([
  $()
], m.prototype, "lagen", 2);
b([
  $()
], m.prototype, "tueren", 2);
b([
  $()
], m.prototype, "hausLive", 2);
b([
  $()
], m.prototype, "hausSel", 2);
b([
  $()
], m.prototype, "aufnahme", 2);
b([
  $()
], m.prototype, "aufnahmeTage", 2);
m = b([
  Ot("raumzonen-panel")
], m);
export {
  m as RaumzonenPanel
};
