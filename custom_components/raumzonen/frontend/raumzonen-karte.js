/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis, V = O.ShadowRoot && (O.ShadyCSS === void 0 || O.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, q = Symbol(), Y = /* @__PURE__ */ new WeakMap();
let pt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (V && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Y.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Y.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Et = (i) => new pt(typeof i == "string" ? i : i + "", void 0, q), St = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[n + 1], i[0]);
  return new pt(e, i, q);
}, Ct = (i, t) => {
  if (V) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), r = O.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, Q = V ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Et(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Mt, defineProperty: Pt, getOwnPropertyDescriptor: zt, getOwnPropertyNames: Rt, getOwnPropertySymbols: Ut, getPrototypeOf: Ht } = Object, N = globalThis, X = N.trustedTypes, Ot = X ? X.emptyScript : "", Tt = N.reactiveElementPolyfillSupport, C = (i, t) => i, W = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Ot : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, ft = (i, t) => !Mt(i, t), tt = { attribute: !0, type: String, converter: W, reflect: !1, useDefault: !1, hasChanged: ft };
Symbol.metadata ??= Symbol("metadata"), N.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let v = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = tt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && Pt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: n } = zt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const h = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? tt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(C("elementProperties"))) return;
    const t = Ht(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(C("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(C("properties"))) {
      const e = this.properties, s = [...Rt(e), ...Ut(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(Q(r));
    } else t !== void 0 && e.push(Q(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
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
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ct(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : W).toAttribute(e, s.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = s.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : W;
      this._$Em = r;
      const h = o.fromAttribute(e, n.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? ft)(n, e) || s.useDefault && s.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
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
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, n] of s) {
        const { wrapped: o } = n, h = this[r];
        o !== !0 || this._$AL.has(r) || h === void 0 || this.C(r, void 0, n, h);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[C("elementProperties")] = /* @__PURE__ */ new Map(), v[C("finalized")] = /* @__PURE__ */ new Map(), Tt?.({ ReactiveElement: v }), (N.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, et = (i) => i, T = K.trustedTypes, st = T ? T.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, $t = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, _t = "?" + _, Nt = `<${_t}>`, y = document, P = () => y.createComment(""), z = (i) => i === null || typeof i != "object" && typeof i != "function", Z = Array.isArray, jt = (i) => Z(i) || typeof i?.[Symbol.iterator] == "function", L = `[ 	
\f\r]`, w = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, it = /-->/g, rt = />/g, g = RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), nt = /'/g, ot = /"/g, gt = /^(?:script|style|textarea|title)$/i, mt = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), D = mt(1), k = mt(2), b = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), at = /* @__PURE__ */ new WeakMap(), m = y.createTreeWalker(y, 129);
function yt(i, t) {
  if (!Z(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return st !== void 0 ? st.createHTML(t) : t;
}
const Lt = (i, t) => {
  const e = i.length - 1, s = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = w;
  for (let h = 0; h < e; h++) {
    const a = i[h];
    let u, d, l = -1, f = 0;
    for (; f < a.length && (o.lastIndex = f, d = o.exec(a), d !== null); ) f = o.lastIndex, o === w ? d[1] === "!--" ? o = it : d[1] !== void 0 ? o = rt : d[2] !== void 0 ? (gt.test(d[2]) && (r = RegExp("</" + d[2], "g")), o = g) : d[3] !== void 0 && (o = g) : o === g ? d[0] === ">" ? (o = r ?? w, l = -1) : d[1] === void 0 ? l = -2 : (l = o.lastIndex - d[2].length, u = d[1], o = d[3] === void 0 ? g : d[3] === '"' ? ot : nt) : o === ot || o === nt ? o = g : o === it || o === rt ? o = w : (o = g, r = void 0);
    const c = o === g && i[h + 1].startsWith("/>") ? " " : "";
    n += o === w ? a + Nt : l >= 0 ? (s.push(u), a.slice(0, l) + $t + a.slice(l) + _ + c) : a + _ + (l === -2 ? h : c);
  }
  return [yt(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class R {
  constructor({ strings: t, _$litType$: e }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const h = t.length - 1, a = this.parts, [u, d] = Lt(t, e);
    if (this.el = R.createElement(u, s), m.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = m.nextNode()) !== null && a.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith($t)) {
          const f = d[o++], c = r.getAttribute(l).split(_), $ = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: n, name: $[2], strings: c, ctor: $[1] === "." ? Bt : $[1] === "?" ? It : $[1] === "@" ? Wt : j }), r.removeAttribute(l);
        } else l.startsWith(_) && (a.push({ type: 6, index: n }), r.removeAttribute(l));
        if (gt.test(r.tagName)) {
          const l = r.textContent.split(_), f = l.length - 1;
          if (f > 0) {
            r.textContent = T ? T.emptyScript : "";
            for (let c = 0; c < f; c++) r.append(l[c], P()), m.nextNode(), a.push({ type: 2, index: ++n });
            r.append(l[f], P());
          }
        }
      } else if (r.nodeType === 8) if (r.data === _t) a.push({ type: 2, index: n });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(_, l + 1)) !== -1; ) a.push({ type: 7, index: n }), l += _.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = y.createElement("template");
    return s.innerHTML = t, s;
  }
}
function A(i, t, e = i, s) {
  if (t === b) return t;
  let r = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const n = z(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(i), r._$AT(i, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = r : e._$Cl = r), r !== void 0 && (t = A(i, r._$AS(i, t.values), r, s)), t;
}
class Dt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, r = (t?.creationScope ?? y).importNode(e, !0);
    m.currentNode = r;
    let n = m.nextNode(), o = 0, h = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let u;
        a.type === 2 ? u = new U(n, n.nextSibling, this, t) : a.type === 1 ? u = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (u = new Vt(n, this, t)), this._$AV.push(u), a = s[++h];
      }
      o !== a?.index && (n = m.nextNode(), o++);
    }
    return m.currentNode = y, r;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class U {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = A(this, t, e), z(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== b && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : jt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && z(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = R.createElement(yt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const n = new Dt(r, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = at.get(t.strings);
    return e === void 0 && at.set(t.strings, e = new R(t)), e;
  }
  k(t) {
    Z(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, r = 0;
    for (const n of t) r === e.length ? e.push(s = new U(this.O(P()), this.O(P()), this, this.options)) : s = e[r], s._$AI(n), r++;
    r < e.length && (this._$AR(s && s._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = et(t).nextSibling;
      et(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class j {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, r, n) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(t, e = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = A(this, t, e, 0), o = !z(t) || t !== this._$AH && t !== b, o && (this._$AH = t);
    else {
      const h = t;
      let a, u;
      for (t = n[0], a = 0; a < n.length - 1; a++) u = A(this, h[s + a], e, a), u === b && (u = this._$AH[a]), o ||= !z(u) || u !== this._$AH[a], u === p ? t = p : t !== p && (t += (u ?? "") + n[a + 1]), this._$AH[a] = u;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Bt extends j {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class It extends j {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class Wt extends j {
  constructor(t, e, s, r, n) {
    super(t, e, s, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = A(this, t, e, 0) ?? p) === b) return;
    const s = this._$AH, r = t === p && s !== p || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== p && (s === p || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Vt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    A(this, t);
  }
}
const qt = K.litHtmlPolyfillSupport;
qt?.(R, U), (K.litHtmlVersions ??= []).push("3.3.3");
const Kt = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = e?.renderBefore ?? null;
    s._$litPart$ = r = new U(t.insertBefore(P(), n), n, void 0, e ?? {});
  }
  return r._$AI(i), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const F = globalThis;
class M extends v {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Kt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return b;
  }
}
M._$litElement$ = !0, M.finalized = !0, F.litElementHydrateSupport?.({ LitElement: M });
const Zt = F.litElementPolyfillSupport;
Zt?.({ LitElement: M });
(F.litElementVersions ??= []).push("4.2.2");
function Ft(i) {
  return i * Math.PI / 180;
}
function G([i, t], e, [s, r] = [0, 0]) {
  const n = Ft(e), o = Math.cos(n), h = Math.sin(n), a = i - s, u = t - r;
  return [s + a * o - u * h, r + a * h + u * o];
}
function Gt(i, t, e, s) {
  const r = t / 2, n = e / 2;
  return [
    [-r, -n],
    [r, -n],
    [r, n],
    [-r, n]
  ].map((o) => G([i[0] + o[0], i[1] + o[1]], s, i));
}
function vt(i) {
  const t = i.x0 ?? 0, e = i.y0 ?? 0;
  return i.zellen.map(([s, r]) => ({ x: t + s * i.groesse, y: e + r * i.groesse, s: i.groesse }));
}
function bt(i) {
  if (i.art === "vieleck") return i.punkte;
  if (i.art === "rechteck") return Gt(i.mitte, i.breite, i.tiefe, i.winkel);
  const t = vt(i), e = t.flatMap((a) => [a.x, a.x + a.s]), s = t.flatMap((a) => [a.y, a.y + a.s]);
  if (!e.length) return [];
  const [r, n, o, h] = [Math.min(...e), Math.max(...e), Math.min(...s), Math.max(...s)];
  return [
    [r, o],
    [n, o],
    [n, h],
    [r, h]
  ];
}
function Jt(i) {
  if (!i.length) return [0, 0];
  let t = 0, e = 0, s = 0;
  for (let r = 0, n = i.length - 1; r < i.length; n = r++) {
    const [o, h] = i[n], [a, u] = i[r], d = o * u - a * h;
    t += d, e += (o + a) * d, s += (h + u) * d;
  }
  return Math.abs(t) < 1e-9 ? [i.reduce((r, n) => r + n[0], 0) / i.length, i.reduce((r, n) => r + n[1], 0) / i.length] : [e / (3 * t), s / (3 * t)];
}
function Yt(i) {
  if (i.art === "rechteck") return i.mitte;
  if (i.art === "zellen") {
    const t = vt(i), e = t.length || 1;
    return [t.reduce((s, r) => s + r.x + r.s / 2, 0) / e, t.reduce((s, r) => s + r.y + r.s / 2, 0) / e];
  }
  return Jt(i.punkte);
}
function E(i, t) {
  const [e, s] = G(i, t.winkel);
  return [e + t.x, s + t.y];
}
function Qt(i, t, e) {
  if (i.length >= 3) return i;
  const s = [e];
  for (const l of t) s.push(...bt(l));
  const r = s.map((l) => l[0]), n = s.map((l) => l[1]), o = 40, [h, a] = [Math.min(...r) - o, Math.max(...r) + o], [u, d] = [Math.min(...n) - o, Math.max(...n) + o];
  return [
    [h, u],
    [a, u],
    [a, d],
    [h, d]
  ];
}
function ht(i, t) {
  if (i.stockwerke?.length) return i.stockwerke;
  const e = i.bereich_id ? t.find((s) => s.id === i.bereich_id) : t.find((s) => s.name.toLowerCase() === i.name.trim().toLowerCase());
  return e?.stockwerk ? [e.stockwerk] : [];
}
function ct(i) {
  return i.art === "melder" && i.umriss.length < 3 ? [
    [0, 0],
    [300, 0],
    [300, 300],
    [0, 300]
  ] : Qt(
    i.umriss,
    i.zonen.map((t) => t.form),
    [i.sensor.x, i.sensor.y]
  );
}
function lt(i) {
  return i.haus_gesetzt ? { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel } : { x: 0, y: 0, winkel: 0 };
}
function B(i, t, e) {
  const [s, r] = G([t * i.cm_pro_px, (i.hoehe_px - e) * i.cm_pro_px], i.winkel ?? 0);
  return [i.x + s, i.y + r];
}
function Xt(i, t = 40) {
  if (!i.length) return [0, 0, 100, 100];
  const e = i.map((r) => r[0]), s = i.map((r) => r[1]);
  return [Math.min(...e) - t, Math.min(...s) - t, Math.max(...e) + t, Math.max(...s) + t];
}
function te(i, t) {
  if (!i || !t) return null;
  const e = (i.kommen_gehen ?? []).filter((s) => s.zone_id === t && s.vor_s <= 4);
  return e.length ? e[e.length - 1].richtung : null;
}
function ee(i, t) {
  return t ? i === "betreten" ? "↓↑ kommt über die Treppe" : "↑↓ über die Treppe weg" : i === "betreten" ? "→ herein" : "← hinaus";
}
function ut(i) {
  return i.art === "ausgang" ? i.treppe ? "treppe" : "tuer" : i.art === "hundeplatz" ? "hund" : i.art === "stelle" ? "stelle" : i.art === "durchgang" ? "durchgang" : i.art === "stoerquelle" ? "ignorieren" : i.regel.schlaefer_halten ? "bett" : "bereich";
}
const I = "raumzonen", se = "anwesenheit", S = ([i, t]) => [i, -t], dt = (i) => i.map((t) => S(t).map((e) => e.toFixed(1)).join(",")).join(" ");
class ie extends M {
  constructor() {
    super(...arguments), this._live = {}, this._bilder = {}, this._fehler = "", this._abos = [], this._geladen = !1;
  }
  static {
    this.properties = {
      hass: { attribute: !1 },
      _config: { state: !0 },
      _data: { state: !0 },
      _live: { state: !0 },
      _bilder: { state: !0 },
      _fehler: { state: !0 }
    };
  }
  static getStubConfig() {
    return { type: "custom:raumzonen-karte", raum: "haus", hintergrund: !0, figuren: !0 };
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "raum", selector: { text: {} } },
        { name: "stockwerk", selector: { floor: {} } },
        { name: "titel", selector: { text: {} } },
        { name: "hintergrund", selector: { boolean: {} } },
        { name: "figuren", selector: { boolean: {} } },
        { name: "hoehe", selector: { number: { min: 150, max: 1200, step: 10, unit_of_measurement: "px" } } }
      ],
      computeLabel: (t) => ({ raum: "Raum („haus“ oder Kennung des Raums)", stockwerk: "Stockwerk (nur Hausplan)", titel: "Titel", hintergrund: "Grundriss zeigen", figuren: "Personen zeigen", hoehe: "Höhe" })[t.name] ?? t.name
    };
  }
  setConfig(t) {
    if (!t) throw new Error("Keine Einstellungen");
    this._config = { raum: "haus", hintergrund: !0, figuren: !0, hoehe: 320, ...t }, this._geladen && this._laden();
  }
  getCardSize() {
    return Math.ceil((this._config?.hoehe ?? 320) / 50) + 1;
  }
  connectedCallback() {
    super.connectedCallback(), this._groesse = new ResizeObserver(() => this.requestUpdate()), this._groesse.observe(this), this.hass && !this._geladen && this._laden();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._groesse?.disconnect(), this._abmelden(), this._geladen = !1;
  }
  updated() {
    this.hass && this._config && !this._geladen && this.isConnected && this._laden();
  }
  async _abmelden() {
    const t = this._abos;
    this._abos = [];
    for (const e of t)
      try {
        await e();
      } catch {
      }
  }
  /** Räume, die die Karte zeigt. */
  _raeume() {
    const t = this._data, e = this._config;
    if (!t || !e) return [];
    if (e.raum && e.raum !== "haus") return t.raeume.filter((r) => r.id === e.raum);
    const s = t.bereiche_ha ?? [];
    return t.raeume.filter((r) => r.haus_gesetzt && (!e.stockwerk || ht(r, s).includes(e.stockwerk)));
  }
  async _laden() {
    if (!this.hass || !this._config) return;
    this._geladen = !0, await this._abmelden();
    try {
      this._data = await this.hass.callWS({ type: `${I}/rooms/get` }), this._fehler = "";
    } catch {
      this._fehler = "Raumzonen ist nicht erreichbar.";
      return;
    }
    const t = this._raeume();
    if (!t.length) {
      this._fehler = this._config.raum && this._config.raum !== "haus" ? `Raum „${this._config.raum}“ gibt es nicht.` : "Kein Raum im Hausplan (oder auf diesem Stockwerk).";
      return;
    }
    for (const e of t)
      try {
        const s = await this.hass.connection.subscribeMessage((r) => this._live = { ...this._live, [e.id]: r }, { type: `${I}/live/subscribe`, raum_id: e.id });
        this._abos.push(s);
      } catch {
      }
    this._config.hintergrund !== !1 && this._ladeBilder();
  }
  async _ladeBilder() {
    for (const t of this._plaene())
      if (!(this._bilder[t.id] || !this.hass))
        try {
          const e = await this.hass.callWS({ type: `${I}/plan/bild/get`, plan_id: t.id }), s = Uint8Array.from(atob(e.bild), (r) => r.charCodeAt(0));
          this._bilder = { ...this._bilder, [t.id]: URL.createObjectURL(new Blob([s], { type: e.mime })) };
        } catch {
        }
  }
  _plaene() {
    const t = this._config, e = this._data?.plaene ?? [], s = this._raeume(), r = this._data?.bereiche_ha ?? [], n = t?.stockwerk ? [t.stockwerk] : [...new Set(s.flatMap((o) => ht(o, r)))];
    return s.length === 1 && !s[0].haus_gesetzt ? [] : e.filter((o) => !o.stockwerk || !n.length || n.includes(o.stockwerk));
  }
  _renderPlan(t) {
    const e = this._bilder[t.id];
    if (!e) return p;
    const [s, r, n] = [B(t, 0, 0), B(t, 1, 0), B(t, 0, 1)].map(S), o = [r[0] - s[0], r[1] - s[1], n[0] - s[0], n[1] - s[1], s[0], s[1]].map((a) => a.toFixed(5)).join(" "), h = t.zuschnitt?.length === 4 ? t.zuschnitt : [0, 0, t.breite_px, t.hoehe_px];
    return k`<g transform="matrix(${o})">
      <clipPath id=${`rzk-${t.id}`}><rect x=${h[0]} y=${h[1]} width=${h[2] - h[0]} height=${h[3] - h[1]} /></clipPath>
      <image class="plan" href=${e} width=${t.breite_px} height=${t.hoehe_px} clip-path=${`url(#rzk-${t.id})`} preserveAspectRatio="none" />
    </g>`;
  }
  _renderRaum(t, e) {
    const s = lt(t), r = this._live[t.id], n = !!r && r.verfuegbar && !r.problem, o = !!r?.zonen[se]?.belegt, h = ct(t).map((c) => E(c, s)), a = t.zonen.filter((c) => ut(c) !== "ignorieren").map((c) => {
      const $ = !!(c.id && r?.zonen[c.id]?.belegt), H = `var(--rz-${ut(c)})`, x = c.art === "ausgang" ? te(r, c.id) : null, At = c.art === "ausgang" ? ";stroke-dasharray:6 4" : "", J = k`<polygon class="zone" points=${dt(bt(c.form).map((kt) => E(kt, s)))} style=${`fill:${H};stroke:${H};fill-opacity:${x ? 0.75 : $ ? 0.55 : 0.15}${At}`} />`;
      if (!x) return J;
      const [xt, wt] = S(E(Yt(c.form), s));
      return k`${J}<text class="kg" x=${xt} y=${wt} style=${`font-size:${12 / e}px`}>${ee(x, !!c.treppe)}</text>`;
    }), u = this._config?.figuren !== !1 && t.art !== "melder" ? (r?.figuren ?? []).filter((c) => !c.tags.includes("wiederhergestellt") && !c.tags.includes("stoerung")).map((c) => {
      const [$, H] = S(E([c.x, c.y], s)), x = c.tags.includes("hund") || c.art === "pet";
      return k`<circle class="figur ${c.gehalten ? "gehalten" : ""}" cx=${$} cy=${H} r=${Math.max(14, 6 / e)} style=${`fill:var(--rz-${x ? "tier" : "person"})`} />`;
    }) : [], [d, l] = S(h.reduce((c, $) => [c[0] + $[0] / h.length, c[1] + $[1] / h.length], [0, 0])), f = 13 / e;
    return k`<g class="raum">
      <polygon class="umriss ${n ? "" : "aus"} ${o ? "da" : ""}" points=${dt(h)} style=${`stroke-width:${Math.max(3, 2.5 / e)}px`} />
      ${a}${u}
      <text class="name" x=${d} y=${l} style=${`font-size:${f}px`}>${t.name}</text>
      <text class="stand" x=${d} y=${l + f * 1.2} style=${`font-size:${f * 0.8}px`}>${n ? o ? "jemand da" : "niemand" : "nicht erreichbar"}</text>
    </g>`;
  }
  render() {
    const t = this._config, e = this._raeume(), s = t?.hoehe ?? 320, r = e.flatMap((c) => ct(c).map(($) => E($, lt(c)))), [n, o, h, a] = Xt(r), u = h - n, d = a - o, l = Math.min(s / Math.max(d, 1), (this.clientWidth || 400) / Math.max(u, 1)), f = t?.titel ?? (t?.raum && t.raum !== "haus" ? e[0]?.name : "Hausplan");
    return D`<ha-card .header=${f || void 0}>
      ${this._fehler ? D`<div class="hinweis">${this._fehler}</div>` : D`<svg viewBox="${n} ${-a} ${u} ${d}" style=${`height:${s}px`} preserveAspectRatio="xMidYMid meet" role="img" aria-label=${f ?? "Raumzonen"}>
            ${t?.hintergrund !== !1 ? this._plaene().map((c) => this._renderPlan(c)) : p}
            ${e.map((c) => this._renderRaum(c, l))}
          </svg>`}
    </ha-card>`;
  }
  static {
    this.styles = St`
    :host {
      --rz-bett: var(--purple-color, #926bc7);
      --rz-bereich: var(--teal-color, #009688);
      --rz-durchgang: var(--cyan-color, #00bcd4);
      --rz-tuer: var(--green-color, #4caf50);
      --rz-treppe: var(--green-color, #4caf50);
      --rz-stelle: var(--orange-color, #ff9800);
      --rz-hund: var(--amber-color, #ffc107);
      --rz-person: var(--teal-color, #009688);
      --rz-tier: var(--amber-color, #ffc107);
    }
    svg {
      display: block;
      width: 100%;
    }
    .plan {
      opacity: 0.55;
    }
    .umriss {
      fill: var(--card-background-color, #fff);
      fill-opacity: 0.6;
      stroke: var(--primary-text-color, #212121);
      stroke-opacity: 0.75;
      stroke-linejoin: round;
    }
    .umriss.da {
      fill: var(--rz-bereich);
      fill-opacity: 0.18;
    }
    .umriss.aus {
      stroke-dasharray: 12 8;
      stroke-opacity: 0.45;
    }
    .zone {
      stroke-width: 2px;
      vector-effect: non-scaling-stroke;
    }
    .figur {
      stroke: var(--card-background-color, #fff);
      stroke-width: 2px;
      vector-effect: non-scaling-stroke;
    }
    .figur.gehalten {
      opacity: 0.5;
    }
    text {
      text-anchor: middle;
      fill: var(--primary-text-color, #212121);
      paint-order: stroke;
      stroke: var(--card-background-color, #fff);
      stroke-width: 3px;
      stroke-linejoin: round;
    }
    .name {
      font-weight: 600;
    }
    .kg {
      fill: var(--rz-tuer);
      font-weight: 700;
      text-anchor: middle;
    }
    .stand {
      fill: var(--secondary-text-color, #727272);
    }
    .hinweis {
      padding: 16px;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
}
customElements.get("raumzonen-karte") || customElements.define("raumzonen-karte", ie);
window.customCards = window.customCards ?? [];
window.customCards.some((i) => i.type === "raumzonen-karte") || window.customCards.push({ type: "raumzonen-karte", name: "Raumzonen", description: "Raum oder Hausplan live: Zonen belegt/frei, Personen, Grundriss.", preview: !1 });
export {
  ie as RaumzonenKarte
};
