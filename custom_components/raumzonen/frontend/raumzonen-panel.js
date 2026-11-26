/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, $e = te.ShadowRoot && (te.ShadyCSS === void 0 || te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xe = Symbol(), Te = /* @__PURE__ */ new WeakMap();
let tt = class {
  constructor(t, s, n) {
    if (this._$cssResult$ = !0, n !== xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if ($e && t === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (t = Te.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), n && Te.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const dt = (e) => new tt(typeof e == "string" ? e : e + "", void 0, xe), pt = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((n, i, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[r + 1], e[0]);
  return new tt(s, e, xe);
}, ft = (e, t) => {
  if ($e) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const n = document.createElement("style"), i = te.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, e.appendChild(n);
  }
}, Re = $e ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const n of t.cssRules) s += n.cssText;
  return dt(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: gt, defineProperty: mt, getOwnPropertyDescriptor: bt, getOwnPropertyNames: $t, getOwnPropertySymbols: xt, getPrototypeOf: vt } = Object, oe = globalThis, Pe = oe.trustedTypes, yt = Pe ? Pe.emptyScript : "", wt = oe.reactiveElementPolyfillSupport, K = (e, t) => e, ie = { toAttribute(e, t) {
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
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, ve = (e, t) => !gt(e, t), Oe = { attribute: !0, type: String, converter: ie, reflect: !1, useDefault: !1, hasChanged: ve };
Symbol.metadata ??= Symbol("metadata"), oe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let N = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = Oe) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(t, n, s);
      i !== void 0 && mt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, s, n) {
    const { get: i, set: r } = bt(this.prototype, t) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const a = i?.call(this);
      r?.call(this, o), this.requestUpdate(t, a, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(K("elementProperties"))) return;
    const t = vt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(K("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(K("properties"))) {
      const s = this.properties, n = [...$t(s), ...xt(s)];
      for (const i of n) this.createProperty(i, s[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [n, i] of s) this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, n] of this.elementProperties) {
      const i = this._$Eu(s, n);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const n = new Set(t.flat(1 / 0).reverse());
      for (const i of n) s.unshift(Re(i));
    } else t !== void 0 && s.push(Re(t));
    return s;
  }
  static _$Eu(t, s) {
    const n = s.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof t == "string" ? t.toLowerCase() : void 0;
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
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const n of s.keys()) this.hasOwnProperty(n) && (t.set(n, this[n]), delete this[n]);
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
  attributeChangedCallback(t, s, n) {
    this._$AK(t, n);
  }
  _$ET(t, s) {
    const n = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, n);
    if (i !== void 0 && n.reflect === !0) {
      const r = (n.converter?.toAttribute !== void 0 ? n.converter : ie).toAttribute(s, n.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const n = this.constructor, i = n._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = n.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ie;
      this._$Em = i;
      const a = o.fromAttribute(s, r.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, n, i = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[t]), n ??= o.getPropertyOptions(t), !((n.hasChanged ?? ve)(r, s) || n.useDefault && n.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, n)))) return;
      this.C(t, s, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: n, reflect: i, wrapped: r }, o) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? s ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || n || (s = void 0), this._$AL.set(t, s)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
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
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, r] of n) {
        const { wrapped: o } = r, a = this[i];
        o !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, r, a);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
N.elementStyles = [], N.shadowRootOptions = { mode: "open" }, N[K("elementProperties")] = /* @__PURE__ */ new Map(), N[K("finalized")] = /* @__PURE__ */ new Map(), wt?.({ ReactiveElement: N }), (oe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis, He = (e) => e, re = ye.trustedTypes, Ce = re ? re.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, st = "$lit$", P = `lit$${Math.random().toFixed(9).slice(2)}$`, nt = "?" + P, kt = `<${nt}>`, C = document, G = () => C.createComment(""), X = (e) => e === null || typeof e != "object" && typeof e != "function", we = Array.isArray, zt = (e) => we(e) || typeof e?.[Symbol.iterator] == "function", he = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, De = /-->/g, Ie = />/g, O = RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ne = /'/g, Ze = /"/g, it = /^(?:script|style|textarea|title)$/i, rt = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = rt(1), m = rt(2), L = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Le = /* @__PURE__ */ new WeakMap(), H = C.createTreeWalker(C, 129);
function ot(e, t) {
  if (!we(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ce !== void 0 ? Ce.createHTML(t) : t;
}
const _t = (e, t) => {
  const s = e.length - 1, n = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = W;
  for (let a = 0; a < s; a++) {
    const l = e[a];
    let h, u, d = -1, x = 0;
    for (; x < l.length && (o.lastIndex = x, u = o.exec(l), u !== null); ) x = o.lastIndex, o === W ? u[1] === "!--" ? o = De : u[1] !== void 0 ? o = Ie : u[2] !== void 0 ? (it.test(u[2]) && (i = RegExp("</" + u[2], "g")), o = O) : u[3] !== void 0 && (o = O) : o === O ? u[0] === ">" ? (o = i ?? W, d = -1) : u[1] === void 0 ? d = -2 : (d = o.lastIndex - u[2].length, h = u[1], o = u[3] === void 0 ? O : u[3] === '"' ? Ze : Ne) : o === Ze || o === Ne ? o = O : o === De || o === Ie ? o = W : (o = O, i = void 0);
    const f = o === O && e[a + 1].startsWith("/>") ? " " : "";
    r += o === W ? l + kt : d >= 0 ? (n.push(h), l.slice(0, d) + st + l.slice(d) + P + f) : l + P + (d === -2 ? a : f);
  }
  return [ot(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), n];
};
class Y {
  constructor({ strings: t, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [h, u] = _t(t, s);
    if (this.el = Y.createElement(h, n), H.currentNode = this.el.content, s === 2 || s === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = H.nextNode()) !== null && l.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(st)) {
          const x = u[o++], f = i.getAttribute(d).split(P), y = /([.?@])?(.*)/.exec(x);
          l.push({ type: 1, index: r, name: y[2], strings: f, ctor: y[1] === "." ? St : y[1] === "?" ? Mt : y[1] === "@" ? Et : ae }), i.removeAttribute(d);
        } else d.startsWith(P) && (l.push({ type: 6, index: r }), i.removeAttribute(d));
        if (it.test(i.tagName)) {
          const d = i.textContent.split(P), x = d.length - 1;
          if (x > 0) {
            i.textContent = re ? re.emptyScript : "";
            for (let f = 0; f < x; f++) i.append(d[f], G()), H.nextNode(), l.push({ type: 2, index: ++r });
            i.append(d[x], G());
          }
        }
      } else if (i.nodeType === 8) if (i.data === nt) l.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(P, d + 1)) !== -1; ) l.push({ type: 7, index: r }), d += P.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const n = C.createElement("template");
    return n.innerHTML = t, n;
  }
}
function F(e, t, s = e, n) {
  if (t === L) return t;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const r = X(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(e), i._$AT(e, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (t = F(e, i._$AS(e, t.values), i, n)), t;
}
class At {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: n } = this._$AD, i = (t?.creationScope ?? C).importNode(s, !0);
    H.currentNode = i;
    let r = H.nextNode(), o = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new J(r, r.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (h = new Tt(r, this, t)), this._$AV.push(h), l = n[++a];
      }
      o !== l?.index && (r = H.nextNode(), o++);
    }
    return H.currentNode = C, i;
  }
  p(t) {
    let s = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(t, n, s), s += n.strings.length - 2) : n._$AI(t[s])), s++;
  }
}
class J {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, n, i) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = F(this, t, s), X(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== L && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : zt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && X(this._$AH) ? this._$AA.nextSibling.data = t : this.T(C.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: n } = t, i = typeof n == "number" ? this._$AC(t) : (n.el === void 0 && (n.el = Y.createElement(ot(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const r = new At(i, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = Le.get(t.strings);
    return s === void 0 && Le.set(t.strings, s = new Y(t)), s;
  }
  k(t) {
    we(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const r of t) i === s.length ? s.push(n = new J(this.O(G()), this.O(G()), this, this.options)) : n = s[i], n._$AI(r), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const n = He(t).nextSibling;
      He(t).remove(), t = n;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class ae {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, n, i, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = s, this._$AM = i, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = p;
  }
  _$AI(t, s = this, n, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = F(this, t, s, 0), o = !X(t) || t !== this._$AH && t !== L, o && (this._$AH = t);
    else {
      const a = t;
      let l, h;
      for (t = r[0], l = 0; l < r.length - 1; l++) h = F(this, a[n + l], s, l), h === L && (h = this._$AH[l]), o ||= !X(h) || h !== this._$AH[l], h === p ? t = p : t !== p && (t += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class St extends ae {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class Mt extends ae {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class Et extends ae {
  constructor(t, s, n, i, r) {
    super(t, s, n, i, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = F(this, t, s, 0) ?? p) === L) return;
    const n = this._$AH, i = t === p && n !== p || t.capture !== n.capture || t.once !== n.once || t.passive !== n.passive, r = t !== p && (n === p || i);
    i && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Tt {
  constructor(t, s, n) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    F(this, t);
  }
}
const Rt = ye.litHtmlPolyfillSupport;
Rt?.(Y, J), (ye.litHtmlVersions ??= []).push("3.3.3");
const Pt = (e, t, s) => {
  const n = s?.renderBefore ?? t;
  let i = n._$litPart$;
  if (i === void 0) {
    const r = s?.renderBefore ?? null;
    n._$litPart$ = i = new J(t.insertBefore(G(), r), r, void 0, s ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis;
class q extends N {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Pt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return L;
  }
}
q._$litElement$ = !0, q.finalized = !0, ke.litElementHydrateSupport?.({ LitElement: q });
const Ot = ke.litElementPolyfillSupport;
Ot?.({ LitElement: q });
(ke.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ht = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ct = { attribute: !0, type: String, converter: ie, reflect: !1, hasChanged: ve }, Dt = (e = Ct, t, s) => {
  const { kind: n, metadata: i } = s;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), n === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), n === "accessor") {
    const { name: o } = s;
    return { set(a) {
      const l = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, l, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (n === "setter") {
    const { name: o } = s;
    return function(a) {
      const l = this[o];
      t.call(this, a), this.requestUpdate(o, l, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function at(e) {
  return (t, s) => typeof s == "object" ? Dt(e, t, s) : ((n, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(e) {
  return at({ ...e, state: !0, attribute: !1 });
}
const It = 25;
function lt(e) {
  return e * Math.PI / 180;
}
function U([e, t], s, [n, i] = [0, 0]) {
  const r = lt(s), o = Math.cos(r), a = Math.sin(r), l = e - n, h = t - i;
  return [n + l * o - h * a, i + l * a + h * o];
}
function fe(e, t) {
  return Math.hypot(e[0] - t[0], e[1] - t[1]);
}
function Nt(e, t) {
  return [Math.round(e[0] / t) * t, Math.round(e[1] / t) * t];
}
function D(e) {
  return [Math.round(e[0] * 10) / 10, Math.round(e[1] * 10) / 10];
}
function se(e, t, s, n) {
  const i = t / 2, r = s / 2;
  return [
    [-i, -r],
    [i, -r],
    [i, r],
    [-i, r]
  ].map((o) => U([e[0] + o[0], e[1] + o[1]], n, e));
}
function ze(e) {
  const t = e.x0 ?? 0, s = e.y0 ?? 0;
  return e.zellen.map(([n, i]) => ({ x: t + n * e.groesse, y: s + i * e.groesse, s: e.groesse }));
}
function _e(e, t, s = 0, n = 0) {
  return [Math.floor((e[0] - s) / t), Math.floor((e[1] - n) / t)];
}
function Z(e) {
  if (e.art === "vieleck") return e.punkte;
  if (e.art === "rechteck") return se(e.mitte, e.breite, e.tiefe, e.winkel);
  const t = ze(e), s = t.flatMap((l) => [l.x, l.x + l.s]), n = t.flatMap((l) => [l.y, l.y + l.s]);
  if (!s.length) return [];
  const [i, r, o, a] = [Math.min(...s), Math.max(...s), Math.min(...n), Math.max(...n)];
  return [
    [i, o],
    [r, o],
    [r, a],
    [i, a]
  ];
}
function Zt([e, t], s) {
  let n = !1;
  for (let i = 0, r = s.length - 1; i < s.length; r = i++) {
    const [o, a] = s[i], [l, h] = s[r];
    a > t != h > t && e < o + (t - a) * (l - o) / (h - a) && (n = !n);
  }
  return n;
}
function Fe(e, t) {
  if (t.art === "zellen") {
    const [s, n] = _e(e, t.groesse, t.x0 ?? 0, t.y0 ?? 0);
    return t.zellen.some(([i, r]) => i === s && r === n);
  }
  return Zt(e, Z(t));
}
function Lt(e) {
  if (!e.length) return [0, 0];
  let t = 0, s = 0, n = 0;
  for (let i = 0, r = e.length - 1; i < e.length; r = i++) {
    const [o, a] = e[r], [l, h] = e[i], u = o * h - l * a;
    t += u, s += (o + l) * u, n += (a + h) * u;
  }
  return Math.abs(t) < 1e-9 ? [e.reduce((i, r) => i + r[0], 0) / e.length, e.reduce((i, r) => i + r[1], 0) / e.length] : [s / (3 * t), n / (3 * t)];
}
function M(e) {
  if (e.art === "rechteck") return e.mitte;
  if (e.art === "zellen") {
    const t = ze(e), s = t.length || 1;
    return [t.reduce((n, i) => n + i.x + i.s / 2, 0) / s, t.reduce((n, i) => n + i.y + i.s / 2, 0) / s];
  }
  return Lt(e.punkte);
}
function Ft(e) {
  let t = 0;
  for (let s = 0, n = e.length - 1; s < e.length; n = s++)
    t += e[n][0] * e[s][1] - e[s][0] * e[n][1];
  return Math.abs(t) / 2;
}
function ee(e, t, s) {
  return (t[0] - e[0]) * (s[1] - e[1]) - (t[1] - e[1]) * (s[0] - e[0]);
}
function Ut(e) {
  const t = e.length;
  for (let s = 0; s < t; s++)
    for (let n = s + 1; n < t; n++) {
      if (Math.abs(s - n) === 1 || Math.abs(s - n) === t - 1) continue;
      const [i, r] = [e[s], e[(s + 1) % t]], [o, a] = [e[n], e[(n + 1) % t]];
      if (ee(i, r, o) * ee(i, r, a) < 0 && ee(o, a, i) * ee(o, a, r) < 0) return !0;
    }
  return !1;
}
function ge(e) {
  return e.art === "zellen" ? e.zellen.length ? "" : "Keine Zelle gewählt" : e.art === "rechteck" ? e.breite > 0 && e.tiefe > 0 ? "" : "Rechteck ohne Fläche" : e.punkte.length < 3 ? "Mindestens drei Ecken" : Ut(e.punkte) ? "Kanten überschneiden sich" : Ft(e.punkte) < 1 ? "Vieleck ohne Fläche" : "";
}
function me(e, t, s) {
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map((r) => D([r[0] + t, r[1] + s])) };
  if (e.art === "rechteck") return { ...e, mitte: D([e.mitte[0] + t, e.mitte[1] + s]) };
  const n = Math.round(t / e.groesse), i = Math.round(s / e.groesse);
  return { ...e, zellen: e.zellen.map(([r, o]) => [r + n, o + i]) };
}
function ht(e) {
  const t = lt(e);
  return [-Math.sin(t), Math.cos(t)];
}
function Ue(e, t, s, n, i = 36) {
  const r = [];
  n >= 360 || r.push(e);
  const a = t - n / 2;
  for (let l = 0; l <= i; l++) {
    const h = a + n * l / i, [u, d] = ht(h);
    r.push([e[0] + u * s, e[1] + d * s]);
  }
  return r;
}
function jt(e, t) {
  const s = U(e, t.winkel);
  return [t.x + s[0], t.y + s[1]];
}
function ce(e, t) {
  const s = Math.atan2(-(t[0] - e[0]), t[1] - e[1]) * 180 / Math.PI;
  return Math.round(s * 10) / 10;
}
function ue(e, t, s) {
  const n = s[0] - t[0], i = s[1] - t[1], r = n * n + i * i;
  if (r === 0) return fe(e, t);
  const o = Math.max(0, Math.min(1, ((e[0] - t[0]) * n + (e[1] - t[1]) * i) / r));
  return fe(e, [t[0] + o * n, t[1] + o * i]);
}
function Wt(e, t) {
  return U([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function Bt(e, t, s) {
  const n = (i) => D(jt(Wt(i, t), s));
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map(n) };
  if (e.art === "rechteck") {
    let i = e.winkel + s.winkel - t.winkel;
    return i > 180 && (i -= 360), i <= -180 && (i += 360), { ...e, mitte: n(e.mitte), winkel: Math.round(i * 10) / 10 };
  }
  return t.winkel !== s.winkel ? e : me(e, s.x - t.x, s.y - t.y);
}
function R(e, t) {
  const [s, n] = U(e, t.winkel);
  return [s + t.x, n + t.y];
}
function Vt(e, t, s) {
  if (e.length >= 3) return e;
  const n = [s];
  for (const d of t) n.push(...Z(d));
  const i = n.map((d) => d[0]), r = n.map((d) => d[1]), o = 40, [a, l] = [Math.min(...i) - o, Math.max(...i) + o], [h, u] = [Math.min(...r) - o, Math.max(...r) + o];
  return [
    [a, h],
    [l, h],
    [l, u],
    [a, u]
  ];
}
function Kt(e, t = 100) {
  const s = {};
  let n = -1 / 0;
  for (const i of e)
    if (i.lage) {
      s[i.id] = i.lage;
      for (const r of i.outline) n = Math.max(n, R(r, i.lage)[0]);
    }
  n === -1 / 0 && (n = -t);
  for (const i of e) {
    if (i.lage) continue;
    const r = Math.min(...i.outline.map((l) => l[0])), o = Math.max(...i.outline.map((l) => l[0])), a = { x: n + t - r, y: 0, winkel: 0 };
    s[i.id] = a, n = a.x + o;
  }
  return s;
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
    const s = JSON.stringify(t);
    this.stack[this.stack.length - 1] !== s && (this.stack.push(s), this.stack.length > this.limit && this.stack.shift());
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
  const s = new Set(t.map((i) => i.name));
  if (!s.has(e)) return e;
  let n = 2;
  for (; s.has(`${e} ${n}`); ) n++;
  return `${e} ${n}`;
}
function Gt(e, t, s, n = "normal") {
  return {
    name: ut("Zone", t),
    art: n,
    form: e,
    regel: { ...s[ct[n]] }
  };
}
function Xt(e, t, s) {
  if (e.art !== "vieleck") return e;
  const n = e.punkte.slice();
  return n[t] = D(s), { ...e, punkte: n };
}
function je(e, t, s) {
  if (e.art !== "vieleck") return e;
  const n = e.punkte.slice();
  return n.splice(t + 1, 0, D(s)), { ...e, punkte: n };
}
function Yt(e, t) {
  return e.art !== "vieleck" || e.punkte.length <= 3 ? e : { ...e, punkte: e.punkte.filter((s, n) => n !== t) };
}
function We(e, t, s) {
  const [n, i] = _e(t, e.groesse, e.x0 ?? 0, e.y0 ?? 0), r = e.zellen.some(([o, a]) => o === n && a === i);
  return s && !r ? { ...e, zellen: [...e.zellen, [n, i]] } : !s && r ? { ...e, zellen: e.zellen.filter(([o, a]) => o !== n || a !== i) } : e;
}
function Be(e, t) {
  return {
    art: "rechteck",
    mitte: D([(e[0] + t[0]) / 2, (e[1] + t[1]) / 2]),
    breite: Math.round(Math.abs(t[0] - e[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(t[1] - e[1]) * 10) / 10,
    winkel: 0
  };
}
function Jt(e) {
  for (const t of e) {
    if (!t.name.trim()) return "Eine Zone hat keinen Namen";
    const s = ge(t.form);
    if (s) return `${t.name}: ${s}`;
  }
  return "";
}
function Qt(e, t, s) {
  const n = e.name.toLowerCase(), i = n.includes("bett"), o = n.includes("tür") || n.includes("tuer") || n.includes("door") ? "ausgang" : "normal";
  return {
    name: ut(e.name, t),
    art: o,
    form: e.form,
    regel: { ...s[i ? "bett" : ct[o]] }
  };
}
const be = [
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
function ne(e) {
  return be.find((t) => t.rolle === e) ?? be[1];
}
function B(e) {
  return e.art === "ausgang" ? "tuer" : e.art === "hundeplatz" ? "hund" : e.art === "stelle" ? "stelle" : e.art === "durchgang" ? "durchgang" : e.art === "stoerquelle" ? "ignorieren" : e.regel.schlaefer_halten ? "bett" : "bereich";
}
function es(e, t, s) {
  const n = ne(t), i = { ...e, art: n.art, regel: { ...s[n.vorlage] } };
  return n.art !== "ausgang" && delete i.fuehrt_zu, i;
}
function Ve(e) {
  return e === 0 ? "sofort" : `nach ${String(e).replace(".", ",")} s`;
}
function Ke(e) {
  const t = e.regel;
  if (e.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const s = [`belegt ${Ve(t.belegt_nach_s)}`, `frei ${Ve(t.frei_nach_s)}`];
  t.schlaefer_halten && s.push("hält Schläfer"), t.max_personen === 1 && s.push("eine Person"), t.hund_ignorieren && s.push("ohne Hund");
  const n = s.join(", ");
  return n.charAt(0).toUpperCase() + n.slice(1) + ".";
}
function ts(e, t, s, n = 10) {
  const i = e.breite / 2, r = e.tiefe / 2, o = [
    t === 0 || t === 3 ? e.mitte[0] + i : e.mitte[0] - i,
    t === 0 || t === 1 ? e.mitte[1] + r : e.mitte[1] - r
  ], a = Math.max(n, Math.abs(s[0] - o[0])), l = Math.max(n, Math.abs(s[1] - o[1])), h = s[0] >= o[0] ? 1 : -1, u = s[1] >= o[1] ? 1 : -1;
  return {
    ...e,
    winkel: 0,
    breite: Math.round(a * 10) / 10,
    tiefe: Math.round(l * 10) / 10,
    mitte: D([o[0] + h * a / 2, o[1] + u * l / 2])
  };
}
function qe(e, t) {
  const s = e.fuehrt_zu ?? "";
  return s ? s === "aussen" ? "nach draußen oder in einen Raum ohne Sensor" : t.find((n) => n.id === s)?.name ?? "unbekannter Raum" : "noch nicht eingetragen";
}
function ss(e) {
  let t = (e % 360 + 540) % 360 - 180;
  return t === -180 && (t = 180), t;
}
const de = (e) => Math.round(e * 10) / 10 + 0;
function Ge(e, t, s) {
  return e.art === "vieleck" ? { ...e, punkte: e.punkte.map((n) => U(n, s, t).map((i) => de(i))) } : e.art === "rechteck" ? { ...e, mitte: U(e.mitte, s, t).map((n) => de(n)), winkel: de(ss(e.winkel + s)) } : e;
}
function I(e) {
  return e.map((t, s) => {
    const n = e[(s + 1) % e.length];
    return [(t[0] + n[0]) / 2, (t[1] + n[1]) / 2];
  });
}
function le(e, t) {
  return [e[t], e[(t + 1) % e.length]];
}
function Xe(e, t, s) {
  const [n, i] = le(e, t), r = i[0] - n[0], o = i[1] - n[1], a = Math.hypot(r, o);
  if (!a) return 0;
  const l = ((s[0] - n[0]) * r + (s[1] - n[1]) * o) / a;
  return Math.max(0, Math.min(a, l));
}
function ns(e, t, s, n, i = 20) {
  const [r, o] = le(e, t), a = Math.hypot(o[0] - r[0], o[1] - r[1]);
  let l = Math.round(Xe(e, t, s) / 5) * 5, h = Math.round(Xe(e, t, n) / 5) * 5;
  return h < l && ([l, h] = [h, l]), h - l < i ? null : { kante: t, von: l, bis: Math.min(h, Math.floor(a)), art: "tuer" };
}
function Ye(e, t) {
  const [s, n] = le(e, t.kante), i = Math.hypot(n[0] - s[0], n[1] - s[1]) || 1, r = (o) => [s[0] + (n[0] - s[0]) * o / i, s[1] + (n[1] - s[1]) * o / i];
  return [r(t.von), r(t.bis)];
}
function Je(e, t, s) {
  const n = [];
  for (const i of e)
    if (t.inserted !== void 0) {
      if (i.kante === t.inserted) continue;
      n.push(i.kante > t.inserted ? { ...i, kante: i.kante + 1 } : i);
    } else if (t.removed !== void 0) {
      const r = (t.removed - 1 + s) % s;
      if (i.kante === t.removed || i.kante === r) continue;
      n.push(i.kante > t.removed ? { ...i, kante: i.kante - 1 } : i);
    }
  return n;
}
function is(e, t, s = 20) {
  const n = [];
  for (const i of t) {
    if (i.kante >= e.length) continue;
    const [r, o] = le(e, i.kante), a = Math.floor(Math.hypot(o[0] - r[0], o[1] - r[1])), l = Math.min(i.bis, a);
    l - i.von >= s && n.push({ ...i, bis: l });
  }
  return n;
}
const rs = pt`
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
`, Qe = 600;
function os(e) {
  const t = Math.max(1, Math.ceil(e * 3)), s = new Float32Array(2 * t + 1);
  let n = 0;
  for (let i = -t; i <= t; i++) {
    const r = Math.exp(-(i * i) / (2 * e * e));
    s[i + t] = r, n += r;
  }
  for (let i = 0; i < s.length; i++) s[i] /= n;
  return s;
}
function as(e, t, s = 8) {
  if (!e.length || !(t > 0)) return null;
  let n = 1 / 0, i = -1 / 0, r = 1 / 0, o = -1 / 0;
  for (const [v, w] of e)
    n = Math.min(n, v), i = Math.max(i, v), r = Math.min(r, w), o = Math.max(o, w);
  const a = Math.max(0.6, s / t), l = os(a), h = (l.length - 1) / 2;
  n -= h, r -= h;
  const u = Math.min(Qe, i - n + 1 + h), d = Math.min(Qe, o - r + 1 + h), x = new Float32Array(u * d);
  for (const [v, w, A] of e) {
    const k = v - n, z = w - r;
    k >= 0 && k < u && z >= 0 && z < d && A > 0 && (x[z * u + k] += A);
  }
  const f = new Float32Array(u * d);
  for (let v = 0; v < d; v++)
    for (let w = 0; w < u; w++) {
      const A = x[v * u + w];
      if (A)
        for (let k = -h; k <= h; k++) {
          const z = w + k;
          z >= 0 && z < u && (f[v * u + z] += A * l[k + h]);
        }
    }
  const y = new Float32Array(u * d);
  let _ = 0;
  for (let v = 0; v < d; v++)
    for (let w = 0; w < u; w++) {
      const A = f[v * u + w];
      if (A)
        for (let k = -h; k <= h; k++) {
          const z = v + k;
          z >= 0 && z < d && (y[z * u + w] += A * l[k + h]);
        }
    }
  for (let v = 0; v < y.length; v++) _ = Math.max(_, y[v]);
  return { x0: n * t, y0: r * t, zelle: t, nx: u, ny: d, werte: y, max: _ };
}
function ls(e, t, s = 0.2) {
  return !(e > s) || !(t > 0) ? 0 : Math.min(1, Math.log1p(e) / Math.log1p(t));
}
function hs(e, t, s = 0.85) {
  const n = new Uint8ClampedArray(e.nx * e.ny * 4);
  for (let i = 0; i < e.ny; i++) {
    const r = e.ny - 1 - i;
    for (let o = 0; o < e.nx; o++) {
      const a = ls(e.werte[i * e.nx + o], e.max);
      if (!a) continue;
      const l = (r * e.nx + o) * 4;
      n[l] = t[0], n[l + 1] = t[1], n[l + 2] = t[2], n[l + 3] = Math.round(255 * s * (0.15 + 0.85 * a));
    }
  }
  return n;
}
function cs(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e)
    for (const [n, i, r] of s) {
      const o = `${n},${i}`, a = t.get(o);
      a ? a[2] += r : t.set(o, [n, i, r]);
    }
  return [...t.values()];
}
function pe(e) {
  if (e < 60) return `${Math.round(e)} s`;
  const t = Math.round(e / 60);
  if (t < 60) return `${t} min`;
  const s = Math.floor(t / 60), n = t % 60;
  return n ? `${s} h ${n} min` : `${s} h`;
}
var us = Object.defineProperty, ds = Object.getOwnPropertyDescriptor, b = (e, t, s, n) => {
  for (var i = n > 1 ? void 0 : n ? ds(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (i = (n ? o(t, s, i) : o(i)) || i);
  return n && i && us(t, s, i), i;
};
const E = "raumzonen", ps = 5, T = 12, fs = [1, 3, 8, 12, 24], et = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" }
], gs = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung."
};
function V(e) {
  return `var(--rz-${e})`;
}
function ms(e) {
  return e.map((t) => `${t[0].toFixed(1)},${t[1].toFixed(1)}`).join(" ");
}
function bs(e) {
  for (const t of [10, 20, 50, 100, 200, 500, 1e3, 2e3]) if (t >= e) return t;
  return 5e3;
}
let g = class extends q {
  constructor() {
    super(...arguments), this.narrow = !1, this.raumId = "", this.zones = [], this.sensor = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 }, this.umriss = [], this.oeffnungen = [], this.selVertex = -1, this.selOpening = -1, this.openingDraft = null, this.selected = -1, this.sensorOpen = !1, this.tab = "zonen", this.tool = "auswahl", this.draft = [], this.rectDraft = null, this.hover = null, this.view = { cx: 0, cy: 250, scale: 0.8 }, this.size = { w: 800, h: 600 }, this.heatMin = 0, this.auswStunden = 8, this.auswLaedt = !1, this.auswFehler = "", this.auswFigur = "", this.layersOpen = !1, this.layers = { figuren: !0, spuren: !0, ziele: !1, abdeckung: !0 }, this.dirty = !1, this.zonesFollow = !0, this.saving = !1, this.error = "", this.toast = "", this.page = "raum", this.lagen = {}, this.tueren = {}, this.hausLive = {}, this.hausSel = "", this.aufnahme = !0, this.aufnahmeTage = 30, this.history = new qt(), this.drag = null, this.liveRoom = "", this.viewTouched = !1, this.sensorAnchor = null, this.hausUnsubs = [], this.fit = () => {
      const e = this.sensor, t = [[e.x, e.y]];
      if (this.page === "haus" && this.data) {
        t.length = 0;
        for (const d of this.data.raeume) {
          const x = this.lagen[d.id];
          x && t.push(...this.outlineOf(d).map((f) => R(f, x)));
        }
      }
      for (const d of this.zones) t.push(...Z(d.form));
      t.push(...this.umriss), t.length < 4 && this.page === "raum" && t.push(...Ue([e.x, e.y], e.winkel, Math.min(e.reichweite_cm, 500), e.oeffnung_grad, 8));
      const s = t.map((d) => d[0]), n = t.map((d) => d[1]), [i, r, o, a] = [Math.min(...s), Math.max(...s), Math.min(...n), Math.max(...n)], l = Math.max(200, r - i), h = Math.max(200, a - o), u = Math.min(this.size.w / (l * 1.2), this.size.h / (h * 1.2));
      this.view = { cx: (i + r) / 2, cy: (o + a) / 2, scale: Math.max(0.05, Math.min(5, u)) };
    }, this.undo = () => {
      const e = this.history.undo();
      e && (this.zones = e.zones, this.sensor = e.sensor, this.umriss = e.umriss, this.oeffnungen = e.oeffnungen ?? [], this.selVertex = -1, this.selOpening = -1, this.selected >= this.zones.length && (this.selected = -1), this.dirty = !0);
    }, this.finishDraft = () => {
      if (this.draft.length >= 3)
        if (this.tool === "umriss")
          this.remember(), this.umriss = this.draft, this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
        else {
          const e = { art: "vieleck", punkte: this.draft }, t = ge(e);
          t ? this.showToast(t) : this.addZone(e);
        }
      this.draft = [], this.tool = "auswahl";
    }, this.onKey = (e) => {
      const t = e.composedPath()[0];
      t && ["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName) || !this.kannAendern || this.page === "haus" || (e.key === "Escape" ? this.setTool("auswahl") : e.key === "Enter" && this.draft.length ? this.finishDraft() : e.key === "Backspace" && this.draft.length ? this.draft = this.draft.slice(0, -1) : (e.key === "Delete" || e.key === "Backspace") && this.selOpening >= 0 ? (this.deleteOpening(this.selOpening), e.preventDefault()) : (e.key === "Delete" || e.key === "Backspace") && this.selected >= 0 && this.selVertex >= 0 ? (this.deleteVertex(this.selected, this.selVertex), e.preventDefault()) : (e.key === "Delete" || e.key === "Backspace") && this.selected >= 0 ? (this.deleteZone(this.selected), e.preventDefault()) : (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && (this.undo(), e.preventDefault()));
    }, this.onContextMenu = (e) => {
      if (e.preventDefault(), !this.kannAendern || this.page !== "raum") return;
      const t = this.toWorld(e), s = this.zones[this.selected];
      if (s?.form.art === "vieleck") {
        const i = s.form.punkte.findIndex((r) => this.near(t, r));
        if (i >= 0) {
          this.remember(), this.deleteVertex(this.selected, i);
          return;
        }
      }
      const n = this.umriss.findIndex((i) => this.near(t, i));
      n >= 0 && this.deleteWallCorner(n);
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
        const e = await this._hass.callWS({ type: `${E}/rooms/get` });
        this.data = e, this.error = "";
        const t = e.raeume.some((s) => s.id === this.raumId);
        this.page === "haus" && e.raeume.length ? (this.raumId = t ? this.raumId : e.raeume[0].id, this.openHaus(!0)) : this.selectRoom(t ? this.raumId : e.raeume[0]?.id ?? "", !0);
      } catch (e) {
        this.error = `Laden fehlgeschlagen: ${e.message ?? e}`;
      }
  }
  /** Nur Admins dürfen ändern; alle anderen sehen nur zu. */
  get kannAendern() {
    return this.data?.darf_aendern !== !1;
  }
  get raum() {
    return this.data?.raeume.find((e) => e.id === this.raumId);
  }
  selectRoom(e, t = !1) {
    if (!t && e === this.raumId && this.page === "raum" || !t && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const s = e !== this.raumId || this.page !== "raum";
    this.page === "haus" && this.unsubscribeHaus(), this.page = "raum", this.raumId = e;
    const n = this.raum;
    if (this.zones = n ? structuredClone(n.zonen) : [], this.umriss = n ? structuredClone(n.umriss) : [], this.oeffnungen = n ? structuredClone(n.oeffnungen ?? []) : [], this.selOpening = -1, this.selVertex = -1, n) {
      const i = n.sensor;
      this.sensor = { x: i.x, y: i.y, winkel: i.winkel, reichweite_cm: i.reichweite_cm, oeffnung_grad: i.oeffnung_grad }, this.aufnahme = n.aufnahme ?? !0, this.aufnahmeTage = n.aufnahme_tage ?? 30;
    }
    this.selected = -1, this.sensorOpen = !1, this.draft = [], this.tool = "auswahl", this.dirty = !1, this.history.clear(), s && (this.viewTouched = !1, this.fit()), this.subscribeLive(), this.loadHeat(), s && (this.ausw = void 0, this.auswFigur = "", this.tab === "auswertung" && this.loadAuswertung());
  }
  async subscribeLive() {
    if (!(!this._hass || this.liveRoom === this.raumId) && (await this.unsubscribeLive(), !!this.raumId)) {
      this.liveRoom = this.raumId;
      try {
        this.unsubLive = await this._hass.connection.subscribeMessage((e) => {
          e.raum_id === this.raumId && (this.live = e);
        }, { type: `${E}/live/subscribe`, raum_id: this.raumId });
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
      const s = await this._hass.callWS({ type: `${E}/auswertung/get`, raum_id: e, stunden: t });
      if (e !== this.raumId || t !== this.auswStunden) return;
      this.ausw = s, this.auswFehler = "", this.auswFigur && !s.figuren.some((n) => n.figur === this.auswFigur) && (this.auswFigur = "");
    } catch (s) {
      if (e !== this.raumId) return;
      const n = s;
      this.ausw = void 0, this.auswFehler = n.code === "off" ? "off" : `Auswertung fehlgeschlagen: ${n.message ?? s}`;
    } finally {
      this.auswLaedt = !1;
    }
  }
  async loadHeat() {
    if (window.clearInterval(this.heatTimer), this.heat = void 0, !this._hass || !this.heatMin || !this.raumId) return;
    const e = async () => {
      try {
        this.heat = await this._hass.callWS({ type: `${E}/heat/get`, raum_id: this.raumId, minuten: this.heatMin });
      } catch {
        this.heat = void 0;
      }
    };
    await e(), this.heatTimer = window.setInterval(e, 3e4);
  }
  async save() {
    if (!this._hass || !this.raum || !this.kannAendern) return;
    const e = Jt(this.zones);
    if (e) {
      this.showToast(e);
      return;
    }
    this.saving = !0, this.error = "";
    try {
      await this._hass.callWS({
        type: `${E}/room/save`,
        raum_id: this.raumId,
        zonen: this.zones,
        sensor: this.sensor,
        umriss: this.umriss,
        oeffnungen: is(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage
      }), this.dirty = !1, this.showToast("Gespeichert."), await this.unsubscribeLive(), await new Promise((t) => window.setTimeout(t, 1500)), await this.load();
    } catch (t) {
      this.showToast(`Nicht gespeichert: ${t.message ?? t}`);
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
          type: `${E}/converter_zones/get`,
          raum_id: this.raumId
        });
        if (!e.zonen.length) {
          this.showToast("Im Konverter sind keine Software-Zonen eingerichtet.");
          return;
        }
        this.remember();
        const t = this.zones.slice();
        for (const s of e.zonen) t.push(Qt(s, t, this.data.vorlagen));
        this.zones = t, this.dirty = !0, this.showToast(`${e.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
      } catch (e) {
        this.showToast(`Konverter-Zonen nicht lesbar: ${e.message ?? e}`);
      }
  }
  // -- Hausplan -------------------------------------------------------------
  outlineOf(e) {
    return Vt(
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
    const s = {};
    for (const i of t) for (const r of i.zonen) r.art === "ausgang" && r.id && (s[`${i.id}/${r.id}`] = r.fuehrt_zu ?? "");
    this.tueren = s;
    const n = this.page === "haus";
    this.page = "haus", this.hausSel = "", this.tool = "auswahl", this.dirty = !1, this.unsubscribeLive(), this.subscribeHaus(), n || (this.viewTouched = !1, this.fit());
  }
  async subscribeHaus() {
    if (await this.unsubscribeHaus(), !(!this._hass || !this.data))
      for (const e of this.data.raeume)
        try {
          const t = await this._hass.connection.subscribeMessage((s) => {
            this.hausLive = { ...this.hausLive, [s.raum_id]: s };
          }, { type: `${E}/live/subscribe`, raum_id: e.id });
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
    const s = this.lagen[e];
    if (!s) return;
    let n = ((s.winkel + t) % 360 + 540) % 360 - 180;
    n === -180 && (n = 180), this.lagen = { ...this.lagen, [e]: { ...s, winkel: n } }, this.dirty = !0;
  }
  async saveHaus() {
    if (!(!this._hass || !this.data || !this.kannAendern)) {
      this.saving = !0;
      try {
        const e = Object.entries(this.tueren).filter(([t, s]) => {
          const [n, i] = t.split("/");
          return (this.data.raeume.find((o) => o.id === n)?.zonen.find((o) => o.id === i)?.fuehrt_zu ?? "") !== s;
        }).map(([t, s]) => {
          const [n, i] = t.split("/");
          return { raum_id: n, zone_id: i, fuehrt_zu: s || null };
        });
        await this._hass.callWS({
          type: `${E}/haus/save`,
          raeume: Object.entries(this.lagen).map(([t, s]) => ({ raum_id: t, x: Math.round(s.x), y: Math.round(s.y), winkel: s.winkel })),
          tueren: e
        }), this.dirty = !1, this.showToast("Hausplan gespeichert."), await this.unsubscribeHaus(), await new Promise((t) => window.setTimeout(t, 1500)), await this.load();
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
    t && !this.resize && (this.resize = new ResizeObserver((s) => {
      const n = s[0].contentRect;
      !n.width || !n.height || n.width === this.size.w && n.height === this.size.h || (this.size = { w: n.width, h: n.height }, this.viewTouched || this.fit());
    }), this.resize.observe(t));
  }
  // -- Umrechnung Bildschirm ↔ Raum ----------------------------------------
  toScreen([e, t]) {
    const { cx: s, cy: n, scale: i } = this.view;
    return [this.size.w / 2 + (e - s) * i, this.size.h / 2 - (t - n) * i];
  }
  screenPoints(e) {
    return ms(e.map((t) => this.toScreen(t)));
  }
  toWorld(e) {
    const s = this.renderRoot.querySelector("svg.plan")?.getBoundingClientRect() ?? { left: 0, top: 0 }, { cx: n, cy: i, scale: r } = this.view;
    return [n + (e.clientX - s.left - this.size.w / 2) / r, i - (e.clientY - s.top - this.size.h / 2) / r];
  }
  snapped(e) {
    return Nt(e, ps);
  }
  px(e) {
    return e * this.view.scale;
  }
  zoom(e, t) {
    this.viewTouched = !0;
    const { cx: s, cy: n, scale: i } = this.view, r = Math.max(0.05, Math.min(8, i * e));
    if (!t) {
      this.view = { cx: s, cy: n, scale: r };
      return;
    }
    const o = i / r;
    this.view = { cx: t[0] - (t[0] - s) * o, cy: t[1] - (t[1] - n) * o, scale: r };
  }
  // -- Bearbeiten ------------------------------------------------------------
  remember() {
    this.history.push({ zones: this.zones, sensor: this.sensor, umriss: this.umriss, oeffnungen: this.oeffnungen });
  }
  updateZone(e, t) {
    const s = this.zones.slice();
    s[e] = { ...s[e], ...t }, this.zones = s, this.dirty = !0;
  }
  updateRegel(e, t) {
    this.remember(), this.updateZone(e, { regel: { ...this.zones[e].regel, ...t } });
  }
  setRolle(e, t) {
    if (!this.data) return;
    this.remember();
    const s = this.zones.slice();
    s[e] = es(s[e], t, this.data.vorlagen), this.zones = s, this.dirty = !0;
  }
  addZone(e) {
    this.data && (this.remember(), this.zones = [...this.zones, Gt(e, this.zones, this.data.vorlagen)], this.select(this.zones.length - 1), this.dirty = !0);
  }
  deleteZone(e) {
    if (e < 0) return;
    const t = this.zones[e]?.name ?? "Zone";
    confirm(`Zone „${t}“ löschen? Bis zum Speichern lässt sich das mit „Rückgängig“ zurückholen.`) && (this.remember(), this.zones = this.zones.filter((s, n) => n !== e), this.selected = -1, this.dirty = !0);
  }
  select(e) {
    e !== this.selected && (this.selVertex = -1), this.selected = e, e >= 0 && (this.selOpening = -1), e >= 0 && (this.sensorOpen = !1, this.openTab("zonen"));
  }
  setTool(e) {
    this.tool = e, this.draft = [], this.rectDraft = null, this.layersOpen = !1, e !== "auswahl" && e !== "zellen" && (this.selected = -1);
  }
  // -- Zeiger ------------------------------------------------------------------
  sensorHandle() {
    const [e, t] = ht(this.sensor.winkel), s = 46 / this.view.scale;
    return [this.sensor.x + e * s, this.sensor.y + t * s];
  }
  near(e, t, s = T) {
    return fe(this.toScreen(e), this.toScreen(t)) <= s;
  }
  zoneAt(e) {
    for (let t = this.zones.length - 1; t >= 0; t--) if (Fe(e, this.zones[t].form)) return t;
    return -1;
  }
  onPointerDown(e) {
    if (e.button === 2) return;
    this.layersOpen = !1;
    const t = e.currentTarget, s = this.toWorld(e), n = this.snapped(s);
    if (t.setPointerCapture(e.pointerId), this.page === "haus") {
      const a = this.hausRoomAt(s);
      this.hausSel = a, a && this.kannAendern ? this.drag = { kind: "haus-raum", id: a, last: s } : this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }
    if (!this.kannAendern) {
      const a = this.zoneAt(s);
      this.select(a), a < 0 && (this.sensorOpen = !1, this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } });
      return;
    }
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft.length >= 3 && this.near(s, this.draft[0]) ? this.finishDraft() : this.draft = [...this.draft, n];
      return;
    }
    if (this.tool === "oeffnung") {
      const a = this.wallAt(s, T * 2);
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
      a < 0 || this.zones[a].form.art !== "zellen" ? (this.addZone({ art: "zellen", groesse: It, zellen: [] }), a = this.zones.length - 1) : this.remember();
      const l = this.zones[a].form, [h, u] = _e(s, l.groesse, l.x0 ?? 0, l.y0 ?? 0), d = !l.zellen.some(([x, f]) => x === h && f === u);
      this.drag = { kind: "paint", add: d }, this.updateZone(a, { form: We(l, s, d) });
      return;
    }
    const i = this.zones[this.selected];
    if (i && i.form.art !== "zellen" && this.near(s, this.zoneRotateHandle(i.form))) {
      this.remember();
      const a = M(i.form);
      this.drag = { kind: "rotate-zone", center: a, start: ce(a, s), anchor: i.form };
      return;
    }
    if (i?.form.art === "vieleck") {
      const a = i.form.punkte.findIndex((h) => this.near(s, h));
      if (a >= 0) {
        if (this.remember(), e.altKey) {
          this.deleteVertex(this.selected, a);
          return;
        }
        this.selVertex = a, this.drag = { kind: "vertex", index: a };
        return;
      }
      const l = I(i.form.punkte).findIndex((h) => this.near(s, h));
      if (l >= 0) {
        this.remember(), this.updateZone(this.selected, { form: je(i.form, l, this.snapped(I(i.form.punkte)[l])) }), this.selVertex = l + 1, this.drag = { kind: "vertex", index: l + 1 };
        return;
      }
    } else if (i?.form.art === "rechteck") {
      const a = i.form, l = se(a.mitte, a.breite, a.tiefe, a.winkel).findIndex((h) => this.near(s, h));
      if (l >= 0) {
        this.remember(), this.drag = { kind: "corner", index: l };
        return;
      }
    }
    if (this.near(s, this.sensorHandle(), T + 2)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor-rotate" }, this.openSensor();
      return;
    }
    if (this.near(s, [this.sensor.x, this.sensor.y], T + 4)) {
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
      const a = I(this.umriss).findIndex((h) => this.near(s, h));
      if (a >= 0) {
        this.remember();
        const h = this.umriss.slice();
        h.splice(a + 1, 0, this.snapped(I(this.umriss)[a])), this.oeffnungen = Je(this.oeffnungen, { inserted: a }, this.umriss.length), this.umriss = h, this.dirty = !0, this.drag = { kind: "umriss-vertex", index: a + 1 };
        return;
      }
      const l = this.openingAt(s);
      if (l >= 0) {
        this.selected = -1, this.selOpening = l, this.sensorOpen = !1, this.openTab("raum");
        return;
      }
    }
    this.selected = -1, this.selOpening = -1, this.sensorOpen = !1, this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
  }
  deleteVertex(e, t) {
    const s = this.zones[e];
    if (s?.form.art === "vieleck") {
      if (s.form.punkte.length <= 3) {
        this.showToast("Eine Fläche braucht mindestens drei Punkte.");
        return;
      }
      this.remember(), this.updateZone(e, { form: Yt(s.form, t) }), this.selVertex = -1;
    }
  }
  deleteWallCorner(e) {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember(), this.oeffnungen = Je(this.oeffnungen, { removed: e }, this.umriss.length), this.umriss = this.umriss.filter((t, s) => s !== e), this.selOpening = -1, this.dirty = !0;
  }
  changeOpening(e, t) {
    this.remember(), this.oeffnungen = this.oeffnungen.map((s, n) => n === e ? { ...s, ...t } : s), this.dirty = !0;
  }
  deleteOpening(e) {
    confirm("Diese Öffnung in der Wand löschen?") && (this.remember(), this.oeffnungen = this.oeffnungen.filter((t, s) => s !== e), this.selOpening = -1, this.dirty = !0);
  }
  turnZone(e, t) {
    const s = this.zones[e];
    !s || s.form.art === "zellen" || (this.remember(), this.updateZone(e, { form: Ge(s.form, M(s.form), t) }));
  }
  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  wallAt(e, t = T) {
    const s = this.umriss.length;
    if (s < 3) return -1;
    let n = -1, i = t;
    for (let r = 0; r < s; r++) {
      const o = ue(this.toScreen(e), this.toScreen(this.umriss[r]), this.toScreen(this.umriss[(r + 1) % s]));
      o <= i && (n = r, i = o);
    }
    return n;
  }
  openingAt(e) {
    return this.oeffnungen.findIndex((t) => {
      const [s, n] = Ye(this.umriss, t);
      return ue(this.toScreen(e), this.toScreen(s), this.toScreen(n)) <= T;
    });
  }
  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  zoneRotateHandle(e) {
    const t = M(e), s = Math.max(...Z(e).map((n) => n[1]));
    return [t[0], s + 36 / this.view.scale];
  }
  openSensor() {
    this.selected = -1, this.sensorOpen = !0, this.openTab("raum");
  }
  onPointerMove(e) {
    const t = this.toWorld(e), s = this.snapped(t);
    this.hover = s;
    const n = this.drag;
    if (!n) return;
    const i = this.zones[this.selected];
    switch (n.kind) {
      case "pan": {
        this.viewTouched = !0;
        const r = (e.clientX - n.start[0]) / this.view.scale, o = (e.clientY - n.start[1]) / this.view.scale;
        this.view = { ...this.view, cx: n.view.cx - r, cy: n.view.cy + o };
        break;
      }
      case "vertex":
        i && this.updateZone(this.selected, { form: Xt(i.form, n.index, s) });
        break;
      case "corner":
        i?.form.art === "rechteck" && this.updateZone(this.selected, { form: ts(i.form, n.index, s) });
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
          this.updateZone(this.selected, { form: me(i.form, l * a, h * a) }), this.drag = { kind: "zone", last: [n.last[0] + l * a, n.last[1] + h * a] };
        } else (r || o) && (this.updateZone(this.selected, { form: me(i.form, r, o) }), this.drag = { kind: "zone", last: s });
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: s[0], y: s[1] });
        break;
      case "sensor-rotate": {
        let r = ce([this.sensor.x, this.sensor.y], t);
        e.shiftKey || (r = Math.round(r / 5) * 5), r <= -180 && (r += 360), this.moveSensor({ ...this.sensor, winkel: r });
        break;
      }
      case "paint":
        i?.form.art === "zellen" && this.updateZone(this.selected, { form: We(i.form, t, n.add) });
        break;
      case "rect":
        this.rectDraft = [n.start, s];
        break;
      case "opening": {
        this.openingDraft = ns(this.umriss, n.kante, n.start, t);
        break;
      }
      case "rotate-zone": {
        let r = ce(n.center, t) - n.start;
        e.shiftKey || (r = Math.round(r / 5) * 5), this.updateZone(this.selected, { form: Ge(n.anchor, n.center, r) });
        break;
      }
      case "haus-raum": {
        const r = Math.round((t[0] - n.last[0]) / 10) * 10, o = Math.round((t[1] - n.last[1]) / 10) * 10;
        if (!r && !o) break;
        const a = this.lagen[n.id];
        this.lagen = { ...this.lagen, [n.id]: { ...a, x: a.x + r, y: a.y + o } }, this.drag = { ...n, last: [n.last[0] + r, n.last[1] + o] }, this.dirty = !0;
        break;
      }
    }
  }
  moveSensor(e) {
    this.sensor = e;
    const t = this.sensorAnchor;
    this.zonesFollow && t && (this.zones = t.zones.map((s) => ({ ...s, form: Bt(s.form, t.sensor, e) }))), this.dirty = !0;
  }
  onPointerUp() {
    const e = this.drag;
    if (this.drag = null, this.sensorAnchor = null, e?.kind === "opening") {
      const t = this.openingDraft;
      this.openingDraft = null, t ? (this.remember(), this.oeffnungen = [...this.oeffnungen, t], this.selOpening = this.oeffnungen.length - 1, this.selected = -1, this.openTab("raum"), this.dirty = !0, this.tool = "auswahl") : this.showToast("Etwas weiter an der Wand entlang ziehen (mindestens 20 cm).");
      return;
    }
    if (e?.kind === "rect" && this.rectDraft) {
      const [t, s] = this.rectDraft;
      this.rectDraft = null, Math.abs(t[0] - s[0]) >= 10 && Math.abs(t[1] - s[1]) >= 10 && (this.addZone(Be(t, s)), this.tool = "auswahl");
    }
  }
  onDoubleClick(e) {
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft = this.draft.slice(0, -1), this.finishDraft();
      return;
    }
    const t = this.zones[this.selected];
    if (this.tool !== "auswahl" || t?.form.art !== "vieleck") return;
    const s = this.toWorld(e), n = t.form.punkte;
    for (let i = 0; i < n.length; i++)
      if (ue(this.toScreen(s), this.toScreen(n[i]), this.toScreen(n[(i + 1) % n.length])) <= T) {
        this.remember(), this.updateZone(this.selected, { form: je(t.form, i, this.snapped(s)) });
        return;
      }
  }
  onWheel(e) {
    e.preventDefault(), this.zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, this.toWorld(e));
  }
  // -- Plan zeichnen -------------------------------------------------------------
  renderGrid() {
    const { w: e, h: t } = this.size, s = this.view.scale, n = this.view.cx - e / 2 / s, i = this.view.cx + e / 2 / s, r = this.view.cy - t / 2 / s, o = this.view.cy + t / 2 / s, a = s > 0.6 ? 50 : s > 0.2 ? 100 : 500, l = [];
    for (let h = Math.floor(n / a) * a; h <= i; h += a) {
      const [u] = this.toScreen([h, 0]);
      l.push(m`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1=${u} y1="0" x2=${u} y2=${t} />`);
    }
    for (let h = Math.floor(r / a) * a; h <= o; h += a) {
      const [, u] = this.toScreen([0, h]);
      l.push(m`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1="0" y1=${u} x2=${e} y2=${u} />`);
    }
    return m`<g>${l}</g>`;
  }
  renderRoom() {
    if (this.umriss.length < 3) return p;
    const e = this.screenPoints(this.umriss), t = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen, s = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen, n = M({ art: "vieleck", punkte: this.umriss });
    return m`<polygon class="floor" points=${e} />
      <polygon class="wall" points=${e} />
      ${s.map((i, r) => this.renderOpening(i, r === this.selOpening || i === this.openingDraft, n))}
      ${t ? m`${this.umriss.map((i) => {
      const [r, o] = this.toScreen(i);
      return m`<circle class="handle" cx=${r} cy=${o} r="5" />`;
    })}
          ${I(this.umriss).map((i) => this.renderPlus(i))}` : p}`;
  }
  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  renderOpening(e, t, s) {
    const [n, i] = Ye(this.umriss, e), [r, o] = this.toScreen(n), [a, l] = this.toScreen(i), h = m`<line class="wall-gap" x1=${r} y1=${o} x2=${a} y2=${l} />`;
    if (e.art === "offen")
      return m`<g class="opening ${t ? "selected" : ""}">${h}<line class="opening-line" x1=${r} y1=${o} x2=${a} y2=${l} /></g>`;
    const [u, d, x, f] = e.anschlag === "ende" ? [a, l, r, o] : [r, o, a, l], y = Math.hypot(x - u, f - d) || 1;
    let _ = -(f - d) / y, v = (x - u) / y;
    const [w, A] = this.toScreen(s);
    (w - u) * _ + (A - d) * v >= 0 !== (e.aufgehen !== "aussen") && (_ = -_, v = -v);
    const z = u + _ * y, S = d + v * y, Q = (x - u) * v - (f - d) * _ > 0 ? 0 : 1;
    return m`<g class="opening ${t ? "selected" : ""}">${h}
      <line class="door-leaf" x1=${u} y1=${d} x2=${z} y2=${S} />
      <path class="door-arc" d="M ${z} ${S} A ${y} ${y} 0 0 ${Q} ${x} ${f}" /></g>`;
  }
  /** Kleines „+“: hier einen Punkt einfügen. */
  renderPlus(e) {
    const [t, s] = this.toScreen(e);
    return m`<g class="plus"><circle cx=${t} cy=${s} r="6" /><path d="M ${t - 3} ${s} H ${t + 3} M ${t} ${s - 3} V ${s + 3}" /></g>`;
  }
  /** Zellen, die gerade als Bewegungskarte gezeigt werden. */
  heatQuelle() {
    if (this.tab === "auswertung" && this.ausw) {
      const e = this.ausw, t = this.auswFigur ? e.figuren.filter((s) => s.figur === this.auswFigur) : e.figuren;
      return { key: `a|${e.bis}|${e.stunden}|${this.auswFigur}`, zellen: cs(t.map((s) => s.zellen)), zelle: e.zelle_cm, sigma: 8 };
    }
    if (this.heat?.zellen.length) {
      const e = this.heat;
      return { key: `h|${e.minuten}|${e.zellen.length}|${e.zellen.reduce((t, s) => t + s[2], 0)}`, zellen: e.zellen, zelle: e.zelle_cm, sigma: e.zelle_cm * 0.75 };
    }
    return null;
  }
  heatRgb() {
    const e = getComputedStyle(this).getPropertyValue("--rz-heat").split(",").map((t) => Number(t.trim()));
    return e.length === 3 && e.every((t) => Number.isFinite(t)) ? [e[0], e[1], e[2]] : [255, 87, 34];
  }
  renderHeat() {
    const e = this.heatQuelle();
    if (!e || !e.zellen.length) return p;
    let t = this.heatBildCache;
    if (t?.key !== e.key) {
      const i = as(e.zellen, e.zelle, e.sigma);
      if (!i) return p;
      const r = document.createElement("canvas");
      r.width = i.nx, r.height = i.ny;
      const o = r.getContext("2d");
      if (!o) return p;
      o.putImageData(new ImageData(hs(i, this.heatRgb()), i.nx, i.ny), 0, 0), t = { key: e.key, href: r.toDataURL(), x0: i.x0, y0: i.y0, w: i.nx * i.zelle, h: i.ny * i.zelle }, this.heatBildCache = t;
    }
    const [s, n] = this.toScreen([t.x0, t.y0 + t.h]);
    return m`<image class="heat" href=${t.href} x=${s} y=${n} width=${this.px(t.w)} height=${this.px(t.h)} preserveAspectRatio="none" />`;
  }
  renderCoverage() {
    if (!this.layers.abdeckung) return p;
    const e = this.sensor;
    return m`<polygon class="coverage" points=${this.screenPoints(Ue([e.x, e.y], e.winkel, e.reichweite_cm, e.oeffnung_grad))} />`;
  }
  renderZone(e, t) {
    const s = (e.id ? this.live?.zonen[e.id]?.belegt : !1) ?? !1, n = B(e), i = V(n), r = t === this.selected, o = s ? 0.5 : 0.2;
    let a;
    if (e.form.art === "zellen")
      a = m`${ze(e.form).map((l) => {
        const [h, u] = this.toScreen([l.x, l.y + l.s]);
        return m`<rect class="zone-shape ${r ? "selected" : ""}" x=${h} y=${u} width=${this.px(l.s)} height=${this.px(l.s)} fill=${i} fill-opacity=${o} stroke=${i} style="stroke-width:1" />`;
      })}`;
    else {
      const l = this.screenPoints(Z(e.form)), h = r && e.regel.rand_cm > 0 ? this.px(e.regel.rand_cm * 2) : 0;
      a = m`
        ${h ? m`<mask id="rz-band-${t}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${l} fill="black" />
              </mask>
              <polygon points=${l} fill="none" stroke=${i} stroke-opacity="0.25" stroke-width=${h} stroke-linejoin="round" mask="url(#rz-band-${t})" />` : p}
        <polygon class="zone-shape ${r ? "selected" : ""}" points=${l} fill=${i} fill-opacity=${o} stroke=${i} />`;
    }
    return m`<g>${a}</g>`;
  }
  /** Beschriftung der Zone; wird nach den Figuren gezeichnet, damit sie lesbar bleibt. */
  renderZoneLabel(e) {
    const t = e.id ? this.live?.zonen[e.id] : void 0, [s, n] = this.toScreen(M(e.form)), i = t ? t.belegt ? `belegt${t.personen > 1 ? ` · ${t.personen}` : ""}` : "frei" : "neu";
    return m`<text class="label" x=${s} y=${n - 2}>${e.name}</text>
      <text class="label sub" x=${s} y=${n + 14}>${i}</text>`;
  }
  renderHandles() {
    const e = this.zones[this.selected];
    if (!e || this.tool !== "auswahl" || !this.kannAendern) return p;
    let t = [];
    e.form.art === "vieleck" ? t = e.form.punkte : e.form.art === "rechteck" && (t = se(e.form.mitte, e.form.breite, e.form.tiefe, e.form.winkel));
    let s = p;
    if (e.form.art !== "zellen") {
      const [n, i] = this.toScreen(M(e.form)), [r, o] = this.toScreen(this.zoneRotateHandle(e.form));
      s = m`<line class="sensor-line" x1=${n} y1=${i} x2=${r} y2=${o} /><circle class="handle angle" cx=${r} cy=${o} r="8"><title>Drehen</title></circle>`;
    }
    return m`${s}
      ${e.form.art === "vieleck" ? I(e.form.punkte).map((n) => this.renderPlus(n)) : p}
      ${t.map((n, i) => {
      const [r, o] = this.toScreen(n), a = e.form.art === "vieleck" && i === this.selVertex;
      return m`<rect class="handle ${a ? "on" : ""}" x=${r - 5} y=${o - 5} width="10" height="10" rx="2" />`;
    })}`;
  }
  renderSensor() {
    const e = this.sensor, [t, s] = this.toScreen([e.x, e.y]), [n, i] = this.toScreen(this.sensorHandle()), r = -e.winkel * Math.PI / 180, o = [4.5, 7.5].map((a) => {
      const l = r - Math.PI / 2 - 0.7, h = r - Math.PI / 2 + 0.7;
      return m`<path class="sensor-wave" d="M ${t + a * Math.cos(l)} ${s + a * Math.sin(l)} A ${a} ${a} 0 0 1 ${t + a * Math.cos(h)} ${s + a * Math.sin(h)}" />`;
    });
    return m`<g>
      ${this.kannAendern ? m`<line class="sensor-line" x1=${t} y1=${s} x2=${n} y2=${i} />
            <circle class="handle angle" cx=${n} cy=${i} r="8" />` : p}
      <circle class="sensor-body" cx=${t} cy=${s} r="12" />
      ${o}
    </g>`;
  }
  renderLive() {
    const e = this.live;
    if (!e) return p;
    const t = [];
    if (this.layers.ziele)
      for (const [, s, n] of e.ziele) {
        const [i, r] = this.toScreen([s, n]);
        t.push(m`<path class="target" d="M${i - 4} ${r - 4} L${i + 4} ${r + 4} M${i - 4} ${r + 4} L${i + 4} ${r - 4}" />`);
      }
    for (const s of e.figuren) {
      if (s.tags.includes("wiederhergestellt") || s.tags.includes("stoerung")) continue;
      const n = s.tags.includes("hund") || s.art === "pet", i = n ? "var(--rz-tier)" : "var(--rz-person)";
      if (this.layers.spuren && s.spur.length > 1 && t.push(m`<polyline class="trail" points=${this.screenPoints(s.spur)} stroke=${i} />`), !this.layers.figuren) continue;
      const [r, o] = this.toScreen([s.x, s.y]), a = Math.max(7, this.px(14));
      t.push(m`<circle class="figure ${s.gehalten ? "held" : ""}" cx=${r} cy=${o} r=${a} fill=${i} stroke=${s.gehalten ? i : "var(--card)"} />`), (n || s.gehalten) && t.push(m`<text class="label sub" x=${r} y=${o - a - 5}>${n ? "Hund?" : "gehalten"}</text>`);
    }
    return m`<g>${t}</g>`;
  }
  renderDraft() {
    if (this.rectDraft) {
      const n = Be(...this.rectDraft);
      if (n.art !== "rechteck") return p;
      const [i, r] = this.toScreen(n.mitte);
      return m`<polygon class="draft" points=${this.screenPoints(se(n.mitte, n.breite, n.tiefe, 0))} />
        <text class="label" x=${i} y=${r + 5}>${(n.breite / 100).toFixed(2)} × ${(n.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return p;
    const e = this.hover ? [...this.draft, this.hover] : this.draft, [t, s] = this.toScreen(this.draft[0]);
    return m`<polyline class="draft" points=${this.screenPoints(e)} style="fill:none" />
      ${this.draft.map((n) => {
      const [i, r] = this.toScreen(n);
      return m`<circle class="draft-dot" cx=${i} cy=${r} r="4" />`;
    })}
      ${this.draft.length >= 3 ? m`<circle class="close-ring" cx=${t} cy=${s} r=${T} />` : p}`;
  }
  hausRoomAt(e) {
    const t = this.data?.raeume ?? [];
    for (let s = t.length - 1; s >= 0; s--) {
      const n = t[s], i = this.lagen[n.id];
      if (i && Fe(e, { art: "vieleck", punkte: this.outlineOf(n).map((r) => R(r, i)) })) return n.id;
    }
    return "";
  }
  /** Mitte einer Tür im Haus. */
  doorCenter(e, t) {
    const s = this.lagen[e.id];
    return s ? R(M(t.form), s) : null;
  }
  renderHausPlan() {
    const e = this.data?.raeume ?? [], t = [], s = [], n = [], i = [];
    for (const r of e) {
      const o = this.lagen[r.id];
      if (!o) continue;
      const a = this.outlineOf(r).map((f) => R(f, o)), l = r.id === this.hausSel, h = this.hausLive[r.id];
      t.push(m`<polygon class="floor" points=${this.screenPoints(a)} />
        <polygon class="wall ${r.umriss.length >= 3 ? "" : "guess"} ${l ? "selected" : ""}" points=${this.screenPoints(a)} />`);
      for (const f of r.zonen) {
        const y = B(f);
        if (y === "ignorieren") continue;
        const _ = (f.id ? h?.zonen[f.id]?.belegt : !1) ?? !1, v = Z(f.form).map((S) => R(S, o));
        if (t.push(m`<polygon class="zone-shape" points=${this.screenPoints(v)} fill=${V(y)} fill-opacity=${_ ? 0.5 : 0.18} stroke=${V(y)} />`), f.art !== "ausgang" || !f.id) continue;
        const w = this.tueren[`${r.id}/${f.id}`] ?? "", A = this.doorCenter(r, f);
        if (!A) continue;
        const [k, z] = this.toScreen(A);
        if (w === "aussen")
          n.push(m`<text class="label sub" x=${k} y=${z - 10}>nach draußen</text>`);
        else if (w) {
          const S = e.find((j) => j.id === w);
          if (!S || r.id > S.id) continue;
          const Q = S.zonen.find((j) => j.art === "ausgang" && j.id && this.tueren[`${S.id}/${j.id}`] === r.id), Ae = this.lagen[S.id], Se = Q ? this.doorCenter(S, Q) : Ae ? R(M({ art: "vieleck", punkte: this.outlineOf(S) }), Ae) : null;
          if (!Se) continue;
          const [Me, Ee] = this.toScreen(Se);
          s.push(m`<line class="link" x1=${k} y1=${z} x2=${Me} y2=${Ee} />
            <circle class="link-dot" cx=${k} cy=${z} r="5" /><circle class="link-dot" cx=${Me} cy=${Ee} r="5" />`);
        }
      }
      const [u, d] = this.toScreen(M({ art: "vieleck", punkte: a })), x = h ? h.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
      n.push(m`<text class="label room" x=${u} y=${d}>${r.name}</text>
        <text class="label sub" x=${u} y=${d + 16}>${h ? x ? `${x} ${x === 1 ? "Person" : "Personen"}` : "niemand" : "nicht erreichbar"}</text>`);
      for (const f of h?.figuren ?? []) {
        if (f.tags.includes("wiederhergestellt") || f.tags.includes("stoerung")) continue;
        const _ = f.tags.includes("hund") || f.art === "pet" ? "var(--rz-tier)" : "var(--rz-person)", [v, w] = this.toScreen(R([f.x, f.y], o)), A = Math.max(6, this.px(14));
        i.push(m`<circle class="figure ${f.gehalten ? "held" : ""}" cx=${v} cy=${w} r=${A} fill=${_} stroke=${f.gehalten ? _ : "var(--card)"} />`);
      }
    }
    return m`${t}${s}${i}${n}`;
  }
  renderScalebar() {
    const e = bs(90 / this.view.scale), t = e >= 100 ? `${e / 100} m` : `${e} cm`;
    return c`<div class="scalebar"><div style="width:${this.px(e)}px"></div>${t}</div>`;
  }
  renderBubble() {
    const e = gs[this.tool];
    if (e) {
      const t = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return c`<div class="bubble">
        <ha-icon icon=${et.find((s) => s.tool === this.tool).icon}></ha-icon>
        <span class="grow">${e}</span>
        ${t ? c`<button class="text" @click=${this.finishDraft}>Fertig</button>` : p}
        <button class="text" @click=${() => this.setTool("auswahl")}>${this.tool === "zellen" ? "Fertig" : "Abbrechen"}</button>
      </div>`;
    }
    return this.kannAendern && !this.zones.length && this.tool === "auswahl" ? c`<div class="bubble">
        <ha-icon icon="mdi:gesture-tap"></ha-icon>
        <span class="grow">Zuerst den <b>Sensor</b> an seinen Platz ziehen und am gelben Griff drehen. Dann links ein Werkzeug wählen und die erste Zone zeichnen.</span>
      </div>` : p;
  }
  renderLayers() {
    if (!this.layersOpen) return p;
    const e = (s, n) => c`<label class="check"
        ><input
          type="checkbox"
          .checked=${this.layers[s]}
          @change=${(i) => this.layers = { ...this.layers, [s]: i.target.checked }}
        /><span>${n}</span></label
      >`, t = (s, n) => c`<button
        class=${this.heatMin === s ? "active" : ""}
        @click=${() => {
      this.heatMin = s, this.loadHeat();
    }}
      >
        ${n}
      </button>`;
    return c`<div class="layers" @pointerdown=${(s) => s.stopPropagation()}>
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
        ${this.page === "haus" ? this.renderHausPlan() : m`${this.renderRoom()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((t, s) => this.renderZone(t, s))} ${this.renderLive()}
              ${this.zones.map((t) => this.renderZoneLabel(t))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(t) => t.stopPropagation()}>
        ${this.kannAendern && this.page === "raum" ? c`${et.map(
      (t) => c`<button class="icon ${this.tool === t.tool ? "on" : ""}" title=${t.label} aria-label=${t.label} @click=${() => this.setTool(t.tool)}>
                  <ha-icon icon=${t.icon}></ha-icon>
                </button>`
    )}
              <span class="sep"></span>` : p}
        ${this.page === "raum" ? c`<button class="icon ${this.layersOpen ? "on" : ""}" title="Ebenen und Bewegungskarte" aria-label="Ebenen" @click=${() => this.layersOpen = !this.layersOpen}>
                <ha-icon icon="mdi:layers-outline"></ha-icon>
              </button>
              <span class="sep"></span>` : p}
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
      ${this.page === "raum" ? c`${this.renderLayers()} ${this.renderBubble()}` : p} ${this.renderScalebar()}
    </div>`;
  }
  // -- Seitenleiste ------------------------------------------------------------
  renderZoneItem(e, t) {
    const s = t === this.selected, n = B(e), i = ne(n), r = e.id ? this.live?.zonen[e.id] : void 0, o = r ? c`<span class="badge ${r.belegt ? "on" : "off"}">${r.belegt ? r.personen > 1 ? `belegt · ${r.personen}` : "belegt" : "frei"}</span>` : c`<span class="badge new">neu</span>`;
    return c`<li class="item ${s ? "open" : ""}" style="--zone:${V(n)}">
      <div class="row" @click=${() => this.select(s ? -1 : t)}>
        <span class="dot"></span>
        <ha-icon icon=${i.icon}></ha-icon>
        <span class="name">${e.name}</span>
        ${o}
      </div>
      ${s ? this.renderInspector(e, t) : p}
    </li>`;
  }
  renderInspector(e, t) {
    const s = e.regel, n = B(e), i = this.data.grenzen, r = (h, u, d, x, f) => c`<label class="field"
        >${u}<input
          type="number"
          min="0"
          max=${x}
          step=${f}
          .value=${String(s[h])}
          @change=${(y) => {
      const _ = Number(y.target.value);
      Number.isFinite(_) && this.updateRegel(t, { [h]: Math.max(0, Math.min(x, _)) });
    }}
        /><span class="unit">${d}</span></label
      >`, o = (h, u, d, x) => c`<label class="check"
        ><input type="checkbox" .checked=${d} @change=${(f) => x(f.target.checked)} /><span
          >${h}<small>${u}</small></span
        ></label
      >`, a = ge(e.form), l = (this.data?.raeume ?? []).filter((h) => h.id !== this.raumId);
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
        ${be.map(
      (h) => c`<button class=${h.rolle === n ? "active" : ""} @click=${() => this.setRolle(t, h.rolle)}>
            <ha-icon icon=${h.icon}></ha-icon>${h.name}
          </button>`
    )}
      </div>
      <p class="hint small">${ne(n).text}</p>
      ${n === "tuer" ? c`<label class="field"
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
            <p class="hint small">Damit weiß Raumzonen später, wer von wo nach wo geht.</p>` : p}
      ${n === "bett" ? c`${o(
      "Nur eine Person im Bett",
      "Dann wird ein starrer Punkt, den der Sensor beim Aufstehen zurücklässt, verworfen.",
      s.max_personen === 1,
      (h) => this.updateRegel(t, { max_personen: h ? 1 : 0 })
    )}
          ${o(
      "Hund nicht mitzählen",
      "Nur ein Hinweis; ob es der Hund ist, ergibt sich aus Hundeplätzen oder der Art, die der Sensor meldet.",
      s.hund_ignorieren,
      (h) => this.updateRegel(t, { hund_ignorieren: h })
    )}` : p}
      ${n !== "ignorieren" ? c`<div class="summary">${Ke(e)}</div>
            <details class="fine">
              <summary>Feineinstellung</summary>
              <div class="fields">
                ${r("belegt_nach_s", "Belegt nach", "s", i.belegt_nach_s, 0.5)} ${r("frei_nach_s", "Frei nach", "s", i.frei_nach_s, 0.5)}
              </div>
              ${r("rand_cm", "Randstreifen (gegen Zittern am Rand)", "cm", i.rand_cm, 5)}
              ${s.schlaefer_halten ? c`<p class="hint small">Als „aufgestanden“ gilt erst, wer sich draußen bewegt, weit genug weg ist oder zur Tür geht:</p>
                    <div class="fields">
                      ${r("weg_rahmen", "Bewegte Meldungen", "", i.weg_rahmen, 1)} ${r("weg_cm", "oder Abstand", "cm", i.weg_cm, 5)}
                    </div>` : p}
            </details>` : p}
      ${e.form.art !== "zellen" ? c`<div class="label-text">Form</div>
            <div class="actions">
              <button class="text small" title="Gegen den Uhrzeigersinn" @click=${() => this.turnZone(t, 15)}><ha-icon icon="mdi:rotate-left"></ha-icon>15°</button>
              <button class="text small" title="Im Uhrzeigersinn" @click=${() => this.turnZone(t, -15)}><ha-icon icon="mdi:rotate-right"></ha-icon>15°</button>
              ${e.form.art === "vieleck" ? c`<button class="text small" ?disabled=${this.selVertex < 0 || e.form.punkte.length <= 3} @click=${() => this.deleteVertex(t, this.selVertex)}>
                    <ha-icon icon="mdi:vector-point-minus"></ha-icon>Punkt löschen
                  </button>` : p}
            </div>
            <p class="hint small">
              Am gelben Griff drehen. ${e.form.art === "vieleck" ? "Das „+“ auf einer Kante fügt einen Punkt ein; Rechtsklick auf einen Punkt löscht ihn." : ""}
            </p>` : p}
      ${a ? c`<div class="note warn">${a}</div>` : p}
      <div class="actions">
        <span class="spacer"></span>
        <button class="text danger" @click=${() => this.deleteZone(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
      </div>
    </div>` : c`<div class="inspector">
        <p class="hint small">${ne(n).text}</p>
        ${n === "tuer" ? c`<div class="summary">Führt ${qe(e, l)}.</div>` : p}
        ${n !== "ignorieren" ? c`<div class="summary">${Ke(e)}</div>` : p}
      </div>`;
  }
  renderZonesTab() {
    return c`
      ${this.zones.length ? c`<ul class="list">
            ${this.zones.map((e, t) => this.renderZoneItem(e, t))}
          </ul>` : c`<p class="hint">${this.kannAendern ? "Noch keine Zonen. Mit den Werkzeugen links am Plan zeichnen, z. B. ein Rechteck über das Bett." : "Noch keine Zonen eingezeichnet."}</p>`}
      ${this.kannAendern ? this.renderNewZone() : p}`;
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
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, s = e?.letzter_rahmen_vor_s, n = e ? e.figuren.filter((r) => !r.tags.includes("wiederhergestellt") && !r.tags.includes("stoerung")).length : 0, i = (r, o, a, l, h) => c`<label class="field"
        >${o}<input
          type="number"
          min=${l}
          max=${h}
          .value=${String(this.sensor[r])}
          @change=${(u) => {
      const d = Number(u.target.value);
      Number.isFinite(d) && (this.remember(), this.sensor = { ...this.sensor, [r]: Math.max(l, Math.min(h, d)) }, this.dirty = !0);
    }}
        /><span class="unit">${a}</span></label
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
                  <dd>${n}</dd>
                  <dt>Letzte Meldung</dt>
                  <dd>${s == null ? "–" : s < 120 ? `vor ${Math.round(s)} s` : `vor ${Math.round(s / 60)} min`}</dd>
                </dl>
                <p class="hint small">Liegt jemand ruhig, meldet der Sensor oft minutenlang nichts. Das ist normal; Raumzonen hält die Figur.</p>
                ${this.kannAendern ? this.renderSensorEdit(i) : p}
              </div>` : p}
        </li>
      </ul>
      ${this.kannAendern ? this.renderRoomEdit() : p}`;
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
        ${this.umriss.length >= 3 ? c`<button class="text small" @click=${() => this.setTool("oeffnung")}><ha-icon icon="mdi:door"></ha-icon>Tür / Öffnung</button>` : p}
        ${this.umriss.length ? c`<button
              class="text small danger"
              @click=${() => {
      this.remember(), this.umriss = [], this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
    }}
            >
              Entfernen
            </button>` : p}
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
        (s) => c`<button
                            class=${e.art === s ? "active" : ""}
                            @click=${() => {
          this.remember(), this.oeffnungen = this.oeffnungen.map((n, i) => i === t ? { ...n, art: s } : n), this.dirty = !0;
        }}
                          >
                            ${s === "tuer" ? "Tür" : "Offen (ohne Tür)"}
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
                          </div>` : p}
                      <p class="hint small">
                        Nur zur Anzeige. Damit Raumzonen „betreten“ und „verlassen“ erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor
                        zeichnen.
                      </p>
                      <div class="actions">
                        <span class="spacer"></span>
                        <button class="text danger" @click=${() => this.deleteOpening(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
                      </div>
                    </div>` : p}
              </li>`
    )}
          </ul>` : p}
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
              @change=${(e) => {
      const t = Math.round(Number(e.target.value));
      Number.isFinite(t) && (this.aufnahmeTage = Math.max(1, Math.min(this.data?.grenzen.aufnahme_tage ?? 365, t)), this.dirty = !0);
    }}
            /><span class="unit">Tage</span></label
          >` : p}`;
  }
  renderHausSide() {
    const e = this.data?.raeume ?? [], t = e.find((i) => i.id === this.hausSel), s = (i, r, o) => c`<button class="text small" @click=${() => this.turnRoom(t.id, i)}><ha-icon icon=${r}></ha-icon>${o}</button>`, n = (i, r) => {
      const o = `${i.id}/${r.id}`, a = this.tueren[o] ?? "", l = e.filter((h) => h.id !== i.id);
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
      </li>` : c`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${r.name}: ${qe({ ...r, fuehrt_zu: a }, l)}</span></li>`;
    };
    return c`<aside class="side">
      <div class="side-body">
        <h3>Hausplan</h3>
        <p class="hint small">
          ${this.kannAendern ? "Räume am Plan an ihren Platz ziehen und hier drehen. Bei jeder Tür eintragen, wohin sie führt; dann sieht Raumzonen, wer von wo nach wo geht." : "So liegen die Räume im Haus. Die Punkte zeigen, wo gerade jemand ist."}
        </p>
        <ul class="list">
          ${e.map((i) => {
      const r = this.hausLive[i.id], o = r ? r.figuren.filter((h) => !h.tags.includes("wiederhergestellt") && !h.tags.includes("stoerung")).length : 0, a = i.id === this.hausSel, l = i.zonen.filter((h) => h.art === "ausgang" && h.id);
      return c`<li class="item ${a ? "open" : ""}">
              <div class="row" @click=${() => this.hausSel = a ? "" : i.id}>
                <span class="marker-icon"><ha-icon icon="mdi:floor-plan"></ha-icon></span>
                <span class="name">${i.name}<small>${i.haus_gesetzt || this.dirty ? "" : "noch nicht eingeordnet"}</small></span>
                <span class="badge ${o ? "on" : "off"}">${r ? o ? `${o}` : "leer" : "nicht erreichbar"}</span>
              </div>
              ${a ? c`<div class="inspector">
                    ${this.kannAendern && t ? c`<div class="label-text">Drehen</div>
                          <div class="actions">
                            ${s(90, "mdi:rotate-left", "90°")} ${s(-90, "mdi:rotate-right", "90°")} ${s(5, "mdi:rotate-left", "5°")}
                            ${s(-5, "mdi:rotate-right", "5°")}
                          </div>` : p}
                    ${l.length ? c`<div class="label-text">Türen</div>
                          <ul class="doors">
                            ${l.map((h) => n(i, h))}
                          </ul>` : c`<p class="hint small">Keine Tür eingezeichnet. Eine Tür zeichnet man im Raum (Rolle „Tür“).</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(i.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>` : p}
            </li>`;
    })}
        </ul>
      </div>
    </aside>`;
  }
  uhr(e) {
    return new Date(e * 1e3).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  }
  /** Zeitleiste: wann im gewählten Zeitraum jemand da war. */
  renderLeiste(e, t) {
    const s = this.ausw, n = Math.max(1, s.bis - s.von);
    return c`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
      <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
      ${e.map(([i, r]) => {
      const o = (i - s.von) / n * 1e3, a = Math.max(3, (r - i) / n * 1e3);
      return m`<rect x=${o.toFixed(1)} y="0" width=${a.toFixed(1)} height="10" fill=${t} />`;
    })}
    </svg>`;
  }
  figurName(e) {
    return e.figur === "kurz" ? "Kurze Spuren" : `${e.hund ? "Hund?" : "Figur"} ${e.nummer}`;
  }
  renderAuswertungTab() {
    const e = this.ausw, t = (a) => this.zones.find((l) => l.id === a)?.name ?? a, s = (a) => {
      const l = this.zones.find((h) => h.id === a);
      return l ? V(B(l)) : "var(--muted)";
    }, n = c`<div class="levels" role="group" aria-label="Zeitraum">
      ${fs.map(
      (a) => c`<button
          class=${this.auswStunden === a ? "active" : ""}
          @click=${() => {
        this.auswStunden = a, this.loadAuswertung();
      }}
        >
          ${a} h
        </button>`
    )}
    </div>`, i = c`<h3>Wer war wann wo?</h3>
      <div class="label-text">Die letzten</div>
      ${n}`;
    if (this.auswFehler === "off")
      return c`${i}<p class="note">Die Aufnahme ist für diesen Raum aus. Einschalten unter <b>Sensor und Raum → Aufnahme</b>; ausgewertet wird ab dann.</p>`;
    if (this.auswFehler) return c`${i}<p class="note warn">${this.auswFehler}</p>`;
    if (!e) return c`${i}<p class="hint">${this.auswLaedt ? "Rechnet …" : "Noch keine Daten."}</p>`;
    const r = e.zonen.filter((a) => a.sekunden > 0).sort((a, l) => l.belegt_s - a.belegt_s), o = c`<div class="achse"><span>${this.uhr(e.von)}</span><span>${this.uhr(e.bis)}</span></div>`;
    return c`${i}
      <p class="hint small">${this.auswLaedt ? "Rechnet …" : `${this.uhr(e.von)} bis ${this.uhr(e.bis)}. Die Karte zeigt, wo jemand war: je dunkler, desto länger. Bei den Zonen steht, wie lange dort jemand war.`}</p>
      <h3>Zonen</h3>
      ${r.length ? c`<ul class="list ausw">
            ${r.map(
      (a) => c`<li class="item" style="--zone:${s(a.zone_id)}">
                <div class="row static">
                  <span class="dot"></span>
                  <span class="name">${t(a.zone_id)}<small>${a.figuren.length ? a.figuren.map((l) => this.figurName(e.figuren.find((h) => h.figur === l))).join(", ") : "nur kurz"}</small></span>
                  <span class="dauer" title=${a.sekunden > a.belegt_s + 60 ? `Alle Figuren zusammen: ${pe(a.sekunden)}` : ""}>${pe(a.belegt_s)}</span>
                </div>
                ${this.renderLeiste(a.abschnitte, "var(--zone)")}
              </li>`
    )}
          </ul>
          ${o}` : c`<p class="hint">In diesem Zeitraum war niemand in einer Zone.</p>`}
      <h3>Figuren</h3>
      ${e.figuren.length ? c`<ul class="list ausw">
            ${e.figuren.map((a) => {
      const l = this.auswFigur === a.figur, h = a.hund ? "var(--rz-tier)" : "var(--rz-person)", u = Object.keys(a.zonen).slice(0, 2).map(t).join(", ");
      return c`<li class="item ${l ? "open" : ""}" style="--zone:${h}">
                <div class="row" role="button" aria-pressed=${l ? "true" : "false"} title="Nur diese Figur auf der Karte zeigen" @click=${() => this.auswFigur = l ? "" : a.figur}>
                  <span class="dot"></span>
                  <span class="name">${this.figurName(a)}<small>${this.uhr(a.erst)} bis ${this.uhr(a.zuletzt)}${u ? ` · ${u}` : ""}</small></span>
                  <span class="dauer">${pe(a.sekunden)}</span>
                </div>
                ${this.renderLeiste(a.abschnitte, "var(--zone)")}
              </li>`;
    })}
          </ul>
          ${o}
          <p class="hint small">
            Antippen zeigt nur diese Figur auf der Karte. Eine Figur ist eine Spur vom Auftauchen bis zum Verschwinden. Wer aufsteht und
            später wiederkommt, kann eine neue Nummer bekommen. Welche Person es ist, weiß Raumzonen noch nicht.
          </p>` : c`<p class="hint">Keine Figuren in diesem Zeitraum.</p>`}`;
  }
  renderSide() {
    return this.page === "haus" ? this.renderHausSide() : c`<aside class="side">
      <div class="tabs" role="tablist">
        <button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => this.openTab("zonen")}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>
        <button class=${this.tab === "raum" ? "active" : ""} role="tab" @click=${() => this.openTab("raum")}><ha-icon icon="mdi:floor-plan"></ha-icon>Sensor und Raum</button>
        ${this.kannAendern ? c`<button class=${this.tab === "auswertung" ? "active" : ""} role="tab" @click=${() => this.openTab("auswertung")}><ha-icon icon="mdi:chart-bubble"></ha-icon>Auswertung</button>` : p}
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
      (s) => c`<button class=${this.page === "raum" && s.id === this.raumId ? "active" : ""} @click=${() => this.selectRoom(s.id)}>${s.name}</button>`
    )}
          </nav>` : p}
      ${this.raum && this.page === "raum" ? c`<span class="live-chip ${t ? "ok" : "down"}" title=${e?.problem ?? ""}><span class="led"></span><span class="text">${t ? "live" : "nicht erreichbar"}</span></span>` : p}
      <span class="spacer"></span>
      ${this.raum && !this.kannAendern ? c`<span class="badge off" title="Ändern dürfen nur Admins">nur ansehen</span>` : p}
      ${this.raum && this.kannAendern ? c`${this.page === "raum" ? c`<button class="icon" title="Rückgängig (Strg+Z)" ?disabled=${!this.history.size} @click=${this.undo}><ha-icon icon="mdi:undo"></ha-icon></button>` : p}
            <button class="text" ?disabled=${!this.dirty || this.saving} @click=${this.discard}><span class="label">Verwerfen</span><ha-icon icon="mdi:close" style=${this.narrow ? "" : "display:none"}></ha-icon></button>
            <button class="primary" ?disabled=${!this.dirty || this.saving} @click=${() => this.page === "haus" ? this.saveHaus() : this.save()}>
              <ha-icon icon="mdi:content-save-outline"></ha-icon><span class="label">${this.saving ? "Speichert …" : "Speichern"}</span>
            </button>` : p}
    </header>`;
  }
  render() {
    return this.data ? this.data.raeume.length ? c`${this.renderHeader()}
      <div class="layout">${this.renderStage()} ${this.renderSide()}</div>
      ${this.toast ? c`<div class="toast" role="status">${this.toast}</div>` : p}` : c`${this.renderHeader()}
        <div class="empty">
          <ha-icon icon="mdi:floor-plan"></ha-icon>
          <p>
            Noch kein Raum. Einen Raum legst du unter <b>Einstellungen → Geräte &amp; Dienste → Raumzonen → Konfigurieren → Raum
            hinzufügen</b> an. Danach erscheint er hier zum Einzeichnen.
          </p>
        </div>` : c`${this.renderHeader()}<div class="empty">${this.error ? c`<ha-icon icon="mdi:alert-circle-outline"></ha-icon><p>${this.error}</p>` : c`<p>Lädt …</p>`}</div>`;
  }
};
g.styles = rs;
b([
  at({ type: Boolean, reflect: !0 })
], g.prototype, "narrow", 2);
b([
  $()
], g.prototype, "data", 2);
b([
  $()
], g.prototype, "raumId", 2);
b([
  $()
], g.prototype, "zones", 2);
b([
  $()
], g.prototype, "sensor", 2);
b([
  $()
], g.prototype, "umriss", 2);
b([
  $()
], g.prototype, "oeffnungen", 2);
b([
  $()
], g.prototype, "selVertex", 2);
b([
  $()
], g.prototype, "selOpening", 2);
b([
  $()
], g.prototype, "openingDraft", 2);
b([
  $()
], g.prototype, "selected", 2);
b([
  $()
], g.prototype, "sensorOpen", 2);
b([
  $()
], g.prototype, "tab", 2);
b([
  $()
], g.prototype, "tool", 2);
b([
  $()
], g.prototype, "draft", 2);
b([
  $()
], g.prototype, "rectDraft", 2);
b([
  $()
], g.prototype, "hover", 2);
b([
  $()
], g.prototype, "view", 2);
b([
  $()
], g.prototype, "size", 2);
b([
  $()
], g.prototype, "live", 2);
b([
  $()
], g.prototype, "heat", 2);
b([
  $()
], g.prototype, "heatMin", 2);
b([
  $()
], g.prototype, "ausw", 2);
b([
  $()
], g.prototype, "auswStunden", 2);
b([
  $()
], g.prototype, "auswLaedt", 2);
b([
  $()
], g.prototype, "auswFehler", 2);
b([
  $()
], g.prototype, "auswFigur", 2);
b([
  $()
], g.prototype, "layersOpen", 2);
b([
  $()
], g.prototype, "layers", 2);
b([
  $()
], g.prototype, "dirty", 2);
b([
  $()
], g.prototype, "zonesFollow", 2);
b([
  $()
], g.prototype, "saving", 2);
b([
  $()
], g.prototype, "error", 2);
b([
  $()
], g.prototype, "toast", 2);
b([
  $()
], g.prototype, "page", 2);
b([
  $()
], g.prototype, "lagen", 2);
b([
  $()
], g.prototype, "tueren", 2);
b([
  $()
], g.prototype, "hausLive", 2);
b([
  $()
], g.prototype, "hausSel", 2);
b([
  $()
], g.prototype, "aufnahme", 2);
b([
  $()
], g.prototype, "aufnahmeTage", 2);
g = b([
  Ht("raumzonen-panel")
], g);
export {
  g as RaumzonenPanel
};
