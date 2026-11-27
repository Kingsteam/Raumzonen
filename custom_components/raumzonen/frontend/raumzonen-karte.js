/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = globalThis, K = N.ShadowRoot && (N.ShadyCSS === void 0 || N.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Z = Symbol(), ee = /* @__PURE__ */ new WeakMap();
let _e = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== Z) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (K && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = ee.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ee.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Pe = (n) => new _e(typeof n == "string" ? n : n + "", void 0, Z), ze = (n, ...e) => {
  const t = n.length === 1 ? n[0] : e.reduce((s, r, i) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + n[i + 1], n[0]);
  return new _e(t, n, Z);
}, Re = (n, e) => {
  if (K) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), r = N.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = t.cssText, n.appendChild(s);
  }
}, te = K ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return Pe(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ue, defineProperty: He, getOwnPropertyDescriptor: Oe, getOwnPropertyNames: Te, getOwnPropertySymbols: Ne, getPrototypeOf: je } = Object, L = globalThis, se = L.trustedTypes, Le = se ? se.emptyScript : "", De = L.reactiveElementPolyfillSupport, P = (n, e) => n, q = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? Le : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, e) {
  let t = n;
  switch (e) {
    case Boolean:
      t = n !== null;
      break;
    case Number:
      t = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(n);
      } catch {
        t = null;
      }
  }
  return t;
} }, me = (n, e) => !Ue(n, e), ne = { attribute: !0, type: String, converter: q, reflect: !1, useDefault: !1, hasChanged: me };
Symbol.metadata ??= Symbol("metadata"), L.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let A = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ne) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, t);
      r !== void 0 && He(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: r, set: i } = Oe(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: r, set(o) {
      const h = r?.call(this);
      i?.call(this, o), this.requestUpdate(e, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ne;
  }
  static _$Ei() {
    if (this.hasOwnProperty(P("elementProperties"))) return;
    const e = je(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(P("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(P("properties"))) {
      const t = this.properties, s = [...Te(t), ...Ne(t)];
      for (const r of s) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, r] of t) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const r = this._$Eu(t, s);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) t.unshift(te(r));
    } else e !== void 0 && t.push(te(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
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
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Re(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const i = (s.converter?.toAttribute !== void 0 ? s.converter : q).toAttribute(t, s.type);
      this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const i = s.getPropertyOptions(r), o = typeof i.converter == "function" ? { fromAttribute: i.converter } : i.converter?.fromAttribute !== void 0 ? i.converter : q;
      this._$Em = r;
      const h = o.fromAttribute(t, i.type);
      this[r] = h ?? this._$Ej?.get(r) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, r = !1, i) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (i = this[e]), s ??= o.getPropertyOptions(e), !((s.hasChanged ?? me)(i, t) || s.useDefault && s.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: r, wrapped: i }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), i !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
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
        for (const [r, i] of this._$Ep) this[r] = i;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, i] of s) {
        const { wrapped: o } = i, h = this[r];
        o !== !0 || this._$AL.has(r) || h === void 0 || this.C(r, void 0, i, h);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
A.elementStyles = [], A.shadowRootOptions = { mode: "open" }, A[P("elementProperties")] = /* @__PURE__ */ new Map(), A[P("finalized")] = /* @__PURE__ */ new Map(), De?.({ ReactiveElement: A }), (L.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const F = globalThis, re = (n) => n, j = F.trustedTypes, ie = j ? j.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, ge = "$lit$", m = `lit$${Math.random().toFixed(9).slice(2)}$`, ye = "?" + m, Be = `<${ye}>`, v = document, R = () => v.createComment(""), U = (n) => n === null || typeof n != "object" && typeof n != "function", G = Array.isArray, Ie = (n) => G(n) || typeof n?.[Symbol.iterator] == "function", B = `[ 	
\f\r]`, S = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, oe = /-->/g, ae = />/g, g = RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), he = /'/g, ce = /"/g, be = /^(?:script|style|textarea|title)$/i, ve = (n) => (e, ...t) => ({ _$litType$: n, strings: e, values: t }), I = ve(1), y = ve(2), w = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), le = /* @__PURE__ */ new WeakMap(), b = v.createTreeWalker(v, 129);
function xe(n, e) {
  if (!G(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ie !== void 0 ? ie.createHTML(e) : e;
}
const Ve = (n, e) => {
  const t = n.length - 1, s = [];
  let r, i = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = S;
  for (let h = 0; h < t; h++) {
    const a = n[h];
    let c, u, l = -1, $ = 0;
    for (; $ < a.length && (o.lastIndex = $, u = o.exec(a), u !== null); ) $ = o.lastIndex, o === S ? u[1] === "!--" ? o = oe : u[1] !== void 0 ? o = ae : u[2] !== void 0 ? (be.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = g) : u[3] !== void 0 && (o = g) : o === g ? u[0] === ">" ? (o = r ?? S, l = -1) : u[1] === void 0 ? l = -2 : (l = o.lastIndex - u[2].length, c = u[1], o = u[3] === void 0 ? g : u[3] === '"' ? ce : he) : o === ce || o === he ? o = g : o === oe || o === ae ? o = S : (o = g, r = void 0);
    const f = o === g && n[h + 1].startsWith("/>") ? " " : "";
    i += o === S ? a + Be : l >= 0 ? (s.push(c), a.slice(0, l) + ge + a.slice(l) + m + f) : a + m + (l === -2 ? h : f);
  }
  return [xe(n, i + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class H {
  constructor({ strings: e, _$litType$: t }, s) {
    let r;
    this.parts = [];
    let i = 0, o = 0;
    const h = e.length - 1, a = this.parts, [c, u] = Ve(e, t);
    if (this.el = H.createElement(c, s), b.currentNode = this.el.content, t === 2 || t === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = b.nextNode()) !== null && a.length < h; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(ge)) {
          const $ = u[o++], f = r.getAttribute(l).split(m), _ = /([.?@])?(.*)/.exec($);
          a.push({ type: 1, index: i, name: _[2], strings: f, ctor: _[1] === "." ? qe : _[1] === "?" ? Ke : _[1] === "@" ? Ze : D }), r.removeAttribute(l);
        } else l.startsWith(m) && (a.push({ type: 6, index: i }), r.removeAttribute(l));
        if (be.test(r.tagName)) {
          const l = r.textContent.split(m), $ = l.length - 1;
          if ($ > 0) {
            r.textContent = j ? j.emptyScript : "";
            for (let f = 0; f < $; f++) r.append(l[f], R()), b.nextNode(), a.push({ type: 2, index: ++i });
            r.append(l[$], R());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ye) a.push({ type: 2, index: i });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(m, l + 1)) !== -1; ) a.push({ type: 7, index: i }), l += m.length - 1;
      }
      i++;
    }
  }
  static createElement(e, t) {
    const s = v.createElement("template");
    return s.innerHTML = e, s;
  }
}
function k(n, e, t = n, s) {
  if (e === w) return e;
  let r = s !== void 0 ? t._$Co?.[s] : t._$Cl;
  const i = U(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== i && (r?._$AO?.(!1), i === void 0 ? r = void 0 : (r = new i(n), r._$AT(n, t, s)), s !== void 0 ? (t._$Co ??= [])[s] = r : t._$Cl = r), r !== void 0 && (e = k(n, r._$AS(n, e.values), r, s)), e;
}
class We {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, r = (e?.creationScope ?? v).importNode(t, !0);
    b.currentNode = r;
    let i = b.nextNode(), o = 0, h = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        a.type === 2 ? c = new O(i, i.nextSibling, this, e) : a.type === 1 ? c = new a.ctor(i, a.name, a.strings, this, e) : a.type === 6 && (c = new Fe(i, this, e)), this._$AV.push(c), a = s[++h];
      }
      o !== a?.index && (i = b.nextNode(), o++);
    }
    return b.currentNode = v, r;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class O {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, s, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = k(this, e, t), U(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== w && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ie(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && U(this._$AH) ? this._$AA.nextSibling.data = e : this.T(v.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = H.createElement(xe(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const i = new We(r, this), o = i.u(this.options);
      i.p(t), this.T(o), this._$AH = i;
    }
  }
  _$AC(e) {
    let t = le.get(e.strings);
    return t === void 0 && le.set(e.strings, t = new H(e)), t;
  }
  k(e) {
    G(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, r = 0;
    for (const i of e) r === t.length ? t.push(s = new O(this.O(R()), this.O(R()), this, this.options)) : s = t[r], s._$AI(i), r++;
    r < t.length && (this._$AR(s && s._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const s = re(e).nextSibling;
      re(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class D {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, r, i) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(e, t = this, s, r) {
    const i = this.strings;
    let o = !1;
    if (i === void 0) e = k(this, e, t, 0), o = !U(e) || e !== this._$AH && e !== w, o && (this._$AH = e);
    else {
      const h = e;
      let a, c;
      for (e = i[0], a = 0; a < i.length - 1; a++) c = k(this, h[s + a], t, a), c === w && (c = this._$AH[a]), o ||= !U(c) || c !== this._$AH[a], c === p ? e = p : e !== p && (e += (c ?? "") + i[a + 1]), this._$AH[a] = c;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class qe extends D {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class Ke extends D {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class Ze extends D {
  constructor(e, t, s, r, i) {
    super(e, t, s, r, i), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = k(this, e, t, 0) ?? p) === w) return;
    const s = this._$AH, r = e === p && s !== p || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, i = e !== p && (s === p || r);
    r && this.element.removeEventListener(this.name, this, s), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Fe {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    k(this, e);
  }
}
const Ge = F.litHtmlPolyfillSupport;
Ge?.(H, O), (F.litHtmlVersions ??= []).push("3.3.3");
const Je = (n, e, t) => {
  const s = t?.renderBefore ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const i = t?.renderBefore ?? null;
    s._$litPart$ = r = new O(e.insertBefore(R(), i), i, void 0, t ?? {});
  }
  return r._$AI(n), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis;
class z extends A {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Je(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return w;
  }
}
z._$litElement$ = !0, z.finalized = !0, J.litElementHydrateSupport?.({ LitElement: z });
const Ye = J.litElementPolyfillSupport;
Ye?.({ LitElement: z });
(J.litElementVersions ??= []).push("4.2.2");
function Qe(n) {
  return n * Math.PI / 180;
}
function Y([n, e], t, [s, r] = [0, 0]) {
  const i = Qe(t), o = Math.cos(i), h = Math.sin(i), a = n - s, c = e - r;
  return [s + a * o - c * h, r + a * h + c * o];
}
function Xe(n, e, t, s) {
  const r = e / 2, i = t / 2;
  return [
    [-r, -i],
    [r, -i],
    [r, i],
    [-r, i]
  ].map((o) => Y([n[0] + o[0], n[1] + o[1]], s, n));
}
function Ae(n) {
  const e = n.x0 ?? 0, t = n.y0 ?? 0;
  return n.zellen.map(([s, r]) => ({ x: e + s * n.groesse, y: t + r * n.groesse, s: n.groesse }));
}
function we(n) {
  if (n.art === "vieleck") return n.punkte;
  if (n.art === "rechteck") return Xe(n.mitte, n.breite, n.tiefe, n.winkel);
  const e = Ae(n), t = e.flatMap((a) => [a.x, a.x + a.s]), s = e.flatMap((a) => [a.y, a.y + a.s]);
  if (!t.length) return [];
  const [r, i, o, h] = [Math.min(...t), Math.max(...t), Math.min(...s), Math.max(...s)];
  return [
    [r, o],
    [i, o],
    [i, h],
    [r, h]
  ];
}
function et(n) {
  if (!n.length) return [0, 0];
  let e = 0, t = 0, s = 0;
  for (let r = 0, i = n.length - 1; r < n.length; i = r++) {
    const [o, h] = n[i], [a, c] = n[r], u = o * c - a * h;
    e += u, t += (o + a) * u, s += (h + c) * u;
  }
  return Math.abs(e) < 1e-9 ? [n.reduce((r, i) => r + i[0], 0) / n.length, n.reduce((r, i) => r + i[1], 0) / n.length] : [t / (3 * e), s / (3 * e)];
}
function tt(n) {
  if (n.art === "rechteck") return n.mitte;
  if (n.art === "zellen") {
    const e = Ae(n), t = e.length || 1;
    return [e.reduce((s, r) => s + r.x + r.s / 2, 0) / t, e.reduce((s, r) => s + r.y + r.s / 2, 0) / t];
  }
  return et(n.punkte);
}
function C(n, e) {
  const [t, s] = Y(n, e.winkel);
  return [t + e.x, s + e.y];
}
function st(n, e, t) {
  if (n.length >= 3) return n;
  const s = [t];
  for (const l of e) s.push(...we(l));
  const r = s.map((l) => l[0]), i = s.map((l) => l[1]), o = 40, [h, a] = [Math.min(...r) - o, Math.max(...r) + o], [c, u] = [Math.min(...i) - o, Math.max(...i) + o];
  return [
    [h, c],
    [a, c],
    [a, u],
    [h, u]
  ];
}
function ue(n, e) {
  if (n.stockwerke?.length) return n.stockwerke;
  const t = n.bereich_id ? e.find((s) => s.id === n.bereich_id) : e.find((s) => s.name.toLowerCase() === n.name.trim().toLowerCase());
  return t?.stockwerk ? [t.stockwerk] : [];
}
function de(n) {
  return n.art === "melder" && n.umriss.length < 3 ? [
    [0, 0],
    [300, 0],
    [300, 300],
    [0, 300]
  ] : st(
    n.umriss,
    n.zonen.map((e) => e.form),
    [n.sensor.x, n.sensor.y]
  );
}
function pe(n) {
  return n.haus_gesetzt ? { x: n.haus_x, y: n.haus_y, winkel: n.haus_winkel } : { x: 0, y: 0, winkel: 0 };
}
function V(n, e, t) {
  const [s, r] = Y([e * n.cm_pro_px, (n.hoehe_px - t) * n.cm_pro_px], n.winkel ?? 0);
  return [n.x + s, n.y + r];
}
function nt(n, e = 40) {
  if (!n.length) return [0, 0, 100, 100];
  const t = n.map((r) => r[0]), s = n.map((r) => r[1]);
  return [Math.min(...t) - e, Math.min(...s) - e, Math.max(...t) + e, Math.max(...s) + e];
}
function rt(n, e) {
  const t = !!e && e.verfuegbar && !e.problem, s = e?.zonen.anwesenheit, r = !!s?.belegt;
  if (!t) return { ok: t, da: r, personen: null, text: "nicht erreichbar" };
  if (n.art === "melder") return { ok: t, da: r, personen: null, text: r ? "jemand da" : "niemand" };
  const i = Math.max(s?.personen ?? 0, r ? 1 : 0);
  return { ok: t, da: i > 0, personen: i, text: i === 0 ? "niemand" : i === 1 ? "1 Person" : `${i} Personen` };
}
function it(n, e) {
  if (!n || !e) return null;
  const t = (n.kommen_gehen ?? []).filter((s) => s.zone_id === e && s.vor_s <= 4);
  return t.length ? t[t.length - 1].richtung : null;
}
function ot(n, e) {
  return n === "unterwegs" ? e ? "zur Treppe …" : "zur Tür …" : e ? n === "betreten" ? "↓↑ kommt über die Treppe" : "↑↓ über die Treppe weg" : n === "betreten" ? "→ herein" : "← hinaus";
}
function fe(n) {
  return n.art === "ausgang" ? n.treppe ? "treppe" : "tuer" : n.art === "hundeplatz" ? "hund" : n.art === "stelle" ? "stelle" : n.art === "durchgang" ? "durchgang" : n.art === "stoerquelle" ? "ignorieren" : n.regel.schlaefer_halten ? "bett" : "bereich";
}
const W = "raumzonen", M = ([n, e]) => [n, -e], $e = (n) => n.map((e) => M(e).map((t) => t.toFixed(1)).join(",")).join(" ");
class at extends z {
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
        { name: "hoehe", selector: { number: { min: 150, max: 1200, step: 10, unit_of_measurement: "px" } } },
        { name: "personen", selector: { boolean: {} } },
        { name: "kompakt", selector: { boolean: {} } }
      ],
      computeLabel: (e) => ({ raum: "Raum („haus“ oder Kennung des Raums)", stockwerk: "Stockwerk (nur Hausplan)", titel: "Titel", hintergrund: "Grundriss zeigen", figuren: "Personen als Punkte", hoehe: "Höhe", personen: "Zahl der Personen je Raum", kompakt: "Kompakt: nur Umrisse und Zahlen" })[e.name] ?? e.name
    };
  }
  setConfig(e) {
    if (!e) throw new Error("Keine Einstellungen");
    this._config = { raum: "haus", hintergrund: !0, figuren: !0, personen: !0, kompakt: !1, hoehe: 320, ...e }, this._geladen && this._laden();
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
    const e = this._abos;
    this._abos = [];
    for (const t of e)
      try {
        await t();
      } catch {
      }
  }
  /** Räume, die die Karte zeigt. */
  _raeume() {
    const e = this._data, t = this._config;
    if (!e || !t) return [];
    if (t.raum && t.raum !== "haus") return e.raeume.filter((r) => r.id === t.raum);
    const s = e.bereiche_ha ?? [];
    return e.raeume.filter((r) => r.haus_gesetzt && (!t.stockwerk || ue(r, s).includes(t.stockwerk)));
  }
  async _laden() {
    if (!this.hass || !this._config) return;
    this._geladen = !0, await this._abmelden();
    try {
      this._data = await this.hass.callWS({ type: `${W}/rooms/get` }), this._fehler = "";
    } catch {
      this._fehler = "Raumzonen ist nicht erreichbar.";
      return;
    }
    const e = this._raeume();
    if (!e.length) {
      this._fehler = this._config.raum && this._config.raum !== "haus" ? `Raum „${this._config.raum}“ gibt es nicht.` : "Kein Raum im Hausplan (oder auf diesem Stockwerk).";
      return;
    }
    for (const t of e)
      try {
        const s = await this.hass.connection.subscribeMessage((r) => this._live = { ...this._live, [t.id]: r }, { type: `${W}/live/subscribe`, raum_id: t.id });
        this._abos.push(s);
      } catch {
      }
    this._config.hintergrund !== !1 && !this._config.kompakt && this._ladeBilder();
  }
  async _ladeBilder() {
    for (const e of this._plaene())
      if (!(this._bilder[e.id] || !this.hass))
        try {
          const t = await this.hass.callWS({ type: `${W}/plan/bild/get`, plan_id: e.id }), s = Uint8Array.from(atob(t.bild), (r) => r.charCodeAt(0));
          this._bilder = { ...this._bilder, [e.id]: URL.createObjectURL(new Blob([s], { type: t.mime })) };
        } catch {
        }
  }
  _plaene() {
    const e = this._config, t = this._data?.plaene ?? [], s = this._raeume(), r = this._data?.bereiche_ha ?? [], i = e?.stockwerk ? [e.stockwerk] : [...new Set(s.flatMap((o) => ue(o, r)))];
    return s.length === 1 && !s[0].haus_gesetzt ? [] : t.filter((o) => !o.stockwerk || !i.length || i.includes(o.stockwerk));
  }
  _renderPlan(e) {
    const t = this._bilder[e.id];
    if (!t) return p;
    const [s, r, i] = [V(e, 0, 0), V(e, 1, 0), V(e, 0, 1)].map(M), o = [r[0] - s[0], r[1] - s[1], i[0] - s[0], i[1] - s[1], s[0], s[1]].map((a) => a.toFixed(5)).join(" "), h = e.zuschnitt?.length === 4 ? e.zuschnitt : [0, 0, e.breite_px, e.hoehe_px];
    return y`<g transform="matrix(${o})">
      <clipPath id=${`rzk-${e.id}`}><rect x=${h[0]} y=${h[1]} width=${h[2] - h[0]} height=${h[3] - h[1]} /></clipPath>
      <image class="plan" href=${t} width=${e.breite_px} height=${e.hoehe_px} clip-path=${`url(#rzk-${e.id})`} preserveAspectRatio="none" />
    </g>`;
  }
  _renderRaum(e, t) {
    const s = pe(e), r = this._live[e.id], i = rt(e, r), { ok: o, da: h } = i, a = !!this._config?.kompakt, c = de(e).map((d) => C(d, s)), u = a ? [] : e.zonen.filter((d) => fe(d) !== "ignorieren").map((d) => {
      const x = !!(d.id && r?.zonen[d.id]?.belegt), T = `var(--rz-${fe(d)})`, E = d.art === "ausgang" ? it(r, d.id) : null, Ee = d.art === "ausgang" ? ";stroke-dasharray:6 4" : "", X = y`<polygon class="zone" points=${$e(we(d.form).map((Me) => C(Me, s)))} style=${`fill:${T};stroke:${T};fill-opacity:${E ? 0.75 : x ? 0.55 : 0.15}${Ee}`} />`;
      if (!E) return X;
      const [Se, Ce] = M(C(tt(d.form), s));
      return y`${X}<text class="kg" x=${Se} y=${Ce} style=${`font-size:${12 / t}px`}>${ot(E, !!d.treppe)}</text>`;
    }), l = !a && this._config?.figuren !== !1 && e.art !== "melder" ? (r?.figuren ?? []).filter((d) => !d.tags.includes("wiederhergestellt") && !d.tags.includes("stoerung")).map((d) => {
      const [x, T] = M(C([d.x, d.y], s)), E = d.tags.includes("hund") || d.art === "pet";
      return y`<circle class="figur ${d.gehalten ? "gehalten" : ""}" cx=${x} cy=${T} r=${Math.max(14, 6 / t)} style=${`fill:var(--rz-${E ? "tier" : "person"})`} />`;
    }) : [], [$, f] = M(c.reduce((d, x) => [d[0] + x[0] / c.length, d[1] + x[1] / c.length], [0, 0])), _ = 13 / t, ke = this._config?.personen !== !1 && o && i.personen !== null, Q = (a ? 30 : 20) / t;
    return y`<g class="raum">
      <polygon class="umriss ${o ? "" : "aus"} ${h ? "da" : ""}" points=${$e(c)} style=${`stroke-width:${Math.max(3, 2.5 / t)}px`} />
      ${u}${l}
      <text class="name" x=${$} y=${f} style=${`font-size:${_}px`}>${e.name}</text>
      ${ke ? y`<text class="zahl ${h ? "da" : ""}" x=${$} y=${f + _ * 0.4 + Q} style=${`font-size:${Q}px`}>${i.personen}</text>` : y`<text class="stand ${h ? "da" : ""}" x=${$} y=${f + _ * 1.2} style=${`font-size:${_ * 0.8}px`}>${i.text}</text>`}
      <title>${e.name}: ${i.text}</title>
    </g>`;
  }
  render() {
    const e = this._config, t = this._raeume(), s = e?.hoehe ?? 320, r = t.flatMap((f) => de(f).map((_) => C(_, pe(f)))), [i, o, h, a] = nt(r), c = h - i, u = a - o, l = Math.min(s / Math.max(u, 1), (this.clientWidth || 400) / Math.max(c, 1)), $ = e?.titel ?? (e?.raum && e.raum !== "haus" ? t[0]?.name : "Hausplan");
    return I`<ha-card .header=${$ || void 0}>
      ${this._fehler ? I`<div class="hinweis">${this._fehler}</div>` : I`<svg viewBox="${i} ${-a} ${c} ${u}" style=${`height:${s}px`} preserveAspectRatio="xMidYMid meet" role="img" aria-label=${$ ?? "Raumzonen"}>
            ${e?.hintergrund !== !1 && !e?.kompakt ? this._plaene().map((f) => this._renderPlan(f)) : p}
            ${t.map((f) => this._renderRaum(f, l))}
          </svg>`}
    </ha-card>`;
  }
  static {
    this.styles = ze`
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
    .stand.da {
      fill: var(--rz-bereich);
      font-weight: 600;
    }
    .zahl {
      font-weight: 700;
      fill: var(--secondary-text-color, #727272);
    }
    .zahl.da {
      fill: var(--rz-bereich);
    }
    .hinweis {
      padding: 16px;
      color: var(--secondary-text-color, #727272);
    }
  `;
  }
}
customElements.get("raumzonen-karte") || customElements.define("raumzonen-karte", at);
window.customCards = window.customCards ?? [];
window.customCards.some((n) => n.type === "raumzonen-karte") || window.customCards.push({ type: "raumzonen-karte", name: "Raumzonen", description: "Raum oder Hausplan live: Zonen belegt/frei, Personen je Raum, Grundriss.", preview: !1 });
export {
  at as RaumzonenKarte
};
