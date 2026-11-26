/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis, Ve = ye.ShadowRoot && (ye.ShadyCSS === void 0 || ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ge = Symbol(), nt = /* @__PURE__ */ new WeakMap();
let Lt = class {
  constructor(t, n, s) {
    if (this._$cssResult$ = !0, s !== Ge) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (Ve && t === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (t = nt.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && nt.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Vt = (e) => new Lt(typeof e == "string" ? e : e + "", void 0, Ge), Gt = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((s, i, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[r + 1], e[0]);
  return new Lt(n, e, Ge);
}, Kt = (e, t) => {
  if (Ve) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const s = document.createElement("style"), i = ye.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, e.appendChild(s);
  }
}, st = Ve ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const s of t.cssRules) n += s.cssText;
  return Vt(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: qt, defineProperty: Xt, getOwnPropertyDescriptor: Jt, getOwnPropertyNames: Yt, getOwnPropertySymbols: Qt, getPrototypeOf: en } = Object, Ee = globalThis, it = Ee.trustedTypes, tn = it ? it.emptyScript : "", nn = Ee.reactiveElementPolyfillSupport, pe = (e, t) => e, Ae = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? tn : null;
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
} }, Ke = (e, t) => !qt(e, t), rt = { attribute: !0, type: String, converter: Ae, reflect: !1, useDefault: !1, hasChanged: Ke };
Symbol.metadata ??= Symbol("metadata"), Ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ne = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = rt) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, n);
      i !== void 0 && Xt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, n, s) {
    const { get: i, set: r } = Jt(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? rt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(pe("elementProperties"))) return;
    const t = en(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(pe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(pe("properties"))) {
      const n = this.properties, s = [...Yt(n), ...Qt(n)];
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
      for (const i of s) n.unshift(st(i));
    } else t !== void 0 && n.push(st(t));
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
    return Kt(t, this.constructor.elementStyles), t;
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
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : Ae).toAttribute(n, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Ae;
      this._$Em = i;
      const o = a.fromAttribute(n, r.type);
      this[i] = o ?? this._$Ej?.get(i) ?? o, this._$Em = null;
    }
  }
  requestUpdate(t, n, s, i = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (r = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? Ke)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
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
ne.elementStyles = [], ne.shadowRootOptions = { mode: "open" }, ne[pe("elementProperties")] = /* @__PURE__ */ new Map(), ne[pe("finalized")] = /* @__PURE__ */ new Map(), nn?.({ ReactiveElement: ne }), (Ee.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qe = globalThis, at = (e) => e, Re = qe.trustedTypes, ot = Re ? Re.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Zt = "$lit$", F = `lit$${Math.random().toFixed(9).slice(2)}$`, Ht = "?" + F, sn = `<${Ht}>`, J = document, ge = () => J.createComment(""), be = (e) => e === null || typeof e != "object" && typeof e != "function", Xe = Array.isArray, rn = (e) => Xe(e) || typeof e?.[Symbol.iterator] == "function", Ze = `[ 	
\f\r]`, le = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, lt = /-->/g, ht = />/g, K = RegExp(`>|${Ze}(?:([^\\s"'>=/]+)(${Ze}*=${Ze}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ct = /'/g, ut = /"/g, It = /^(?:script|style|textarea|title)$/i, Ot = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), u = Ot(1), v = Ot(2), ie = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), dt = /* @__PURE__ */ new WeakMap(), X = J.createTreeWalker(J, 129);
function Nt(e, t) {
  if (!Xe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ot !== void 0 ? ot.createHTML(t) : t;
}
const an = (e, t) => {
  const n = e.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = le;
  for (let o = 0; o < n; o++) {
    const h = e[o];
    let l, c, d = -1, g = 0;
    for (; g < h.length && (a.lastIndex = g, c = a.exec(h), c !== null); ) g = a.lastIndex, a === le ? c[1] === "!--" ? a = lt : c[1] !== void 0 ? a = ht : c[2] !== void 0 ? (It.test(c[2]) && (i = RegExp("</" + c[2], "g")), a = K) : c[3] !== void 0 && (a = K) : a === K ? c[0] === ">" ? (a = i ?? le, d = -1) : c[1] === void 0 ? d = -2 : (d = a.lastIndex - c[2].length, l = c[1], a = c[3] === void 0 ? K : c[3] === '"' ? ut : ct) : a === ut || a === ct ? a = K : a === lt || a === ht ? a = le : (a = K, i = void 0);
    const p = a === K && e[o + 1].startsWith("/>") ? " " : "";
    r += a === le ? h + sn : d >= 0 ? (s.push(l), h.slice(0, d) + Zt + h.slice(d) + F + p) : h + F + (d === -2 ? o : p);
  }
  return [Nt(e, r + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class $e {
  constructor({ strings: t, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const o = t.length - 1, h = this.parts, [l, c] = an(t, n);
    if (this.el = $e.createElement(l, s), X.currentNode = this.el.content, n === 2 || n === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = X.nextNode()) !== null && h.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(Zt)) {
          const g = c[a++], p = i.getAttribute(d).split(F), f = /([.?@])?(.*)/.exec(g);
          h.push({ type: 1, index: r, name: f[2], strings: p, ctor: f[1] === "." ? ln : f[1] === "?" ? hn : f[1] === "@" ? cn : Pe }), i.removeAttribute(d);
        } else d.startsWith(F) && (h.push({ type: 6, index: r }), i.removeAttribute(d));
        if (It.test(i.tagName)) {
          const d = i.textContent.split(F), g = d.length - 1;
          if (g > 0) {
            i.textContent = Re ? Re.emptyScript : "";
            for (let p = 0; p < g; p++) i.append(d[p], ge()), X.nextNode(), h.push({ type: 2, index: ++r });
            i.append(d[g], ge());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ht) h.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(F, d + 1)) !== -1; ) h.push({ type: 7, index: r }), d += F.length - 1;
      }
      r++;
    }
  }
  static createElement(t, n) {
    const s = J.createElement("template");
    return s.innerHTML = t, s;
  }
}
function re(e, t, n = e, s) {
  if (t === ie) return t;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const r = be(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(e), i._$AT(e, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (t = re(e, i._$AS(e, t.values), i, s)), t;
}
class on {
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
    const { el: { content: n }, parts: s } = this._$AD, i = (t?.creationScope ?? J).importNode(n, !0);
    X.currentNode = i;
    let r = X.nextNode(), a = 0, o = 0, h = s[0];
    for (; h !== void 0; ) {
      if (a === h.index) {
        let l;
        h.type === 2 ? l = new ke(r, r.nextSibling, this, t) : h.type === 1 ? l = new h.ctor(r, h.name, h.strings, this, t) : h.type === 6 && (l = new un(r, this, t)), this._$AV.push(l), h = s[++o];
      }
      a !== h?.index && (r = X.nextNode(), a++);
    }
    return X.currentNode = J, i;
  }
  p(t) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, n), n += s.strings.length - 2) : s._$AI(t[n])), n++;
  }
}
class ke {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, n, s, i) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = t, this._$AB = n, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    t = re(this, t, n), be(t) ? t === m || t == null || t === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : t !== this._$AH && t !== ie && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : rn(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== m && be(this._$AH) ? this._$AA.nextSibling.data = t : this.T(J.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = $e.createElement(Nt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new on(i, this), a = r.u(this.options);
      r.p(n), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let n = dt.get(t.strings);
    return n === void 0 && dt.set(t.strings, n = new $e(t)), n;
  }
  k(t) {
    Xe(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of t) i === n.length ? n.push(s = new ke(this.O(ge()), this.O(ge()), this, this.options)) : s = n[i], s._$AI(r), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t !== this._$AB; ) {
      const s = at(t).nextSibling;
      at(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Pe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, n, s, i, r) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = t, this.name = n, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = m;
  }
  _$AI(t, n = this, s, i) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = re(this, t, n, 0), a = !be(t) || t !== this._$AH && t !== ie, a && (this._$AH = t);
    else {
      const o = t;
      let h, l;
      for (t = r[0], h = 0; h < r.length - 1; h++) l = re(this, o[s + h], n, h), l === ie && (l = this._$AH[h]), a ||= !be(l) || l !== this._$AH[h], l === m ? t = m : t !== m && (t += (l ?? "") + r[h + 1]), this._$AH[h] = l;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ln extends Pe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === m ? void 0 : t;
  }
}
class hn extends Pe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== m);
  }
}
class cn extends Pe {
  constructor(t, n, s, i, r) {
    super(t, n, s, i, r), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = re(this, t, n, 0) ?? m) === ie) return;
    const s = this._$AH, i = t === m && s !== m || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== m && (s === m || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class un {
  constructor(t, n, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    re(this, t);
  }
}
const dn = qe.litHtmlPolyfillSupport;
dn?.($e, ke), (qe.litHtmlVersions ??= []).push("3.3.3");
const pn = (e, t, n) => {
  const s = n?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new ke(t.insertBefore(ge(), r), r, void 0, n ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Je = globalThis;
class me extends ne {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = pn(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ie;
  }
}
me._$litElement$ = !0, me.finalized = !0, Je.litElementHydrateSupport?.({ LitElement: me });
const mn = Je.litElementPolyfillSupport;
mn?.({ LitElement: me });
(Je.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fn = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const gn = { attribute: !0, type: String, converter: Ae, reflect: !1, hasChanged: Ke }, bn = (e = gn, t, n) => {
  const { kind: s, metadata: i } = n;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(n.name, e), s === "accessor") {
    const { name: a } = n;
    return { set(o) {
      const h = t.get.call(this);
      t.set.call(this, o), this.requestUpdate(a, h, e, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(a, void 0, e, o), o;
    } };
  }
  if (s === "setter") {
    const { name: a } = n;
    return function(o) {
      const h = this[a];
      t.call(this, o), this.requestUpdate(a, h, e, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function Bt(e) {
  return (t, n) => typeof n == "object" ? bn(e, t, n) : ((s, i, r) => {
    const a = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), a ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(e, t, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function z(e) {
  return Bt({ ...e, state: !0, attribute: !1 });
}
const $n = 25;
function Dt(e) {
  return e * Math.PI / 180;
}
function P([e, t], n, [s, i] = [0, 0]) {
  const r = Dt(n), a = Math.cos(r), o = Math.sin(r), h = e - s, l = t - i;
  return [s + h * a - l * o, i + h * o + l * a];
}
function Fe(e, t) {
  return Math.hypot(e[0] - t[0], e[1] - t[1]);
}
function kn(e, t) {
  return [Math.round(e[0] / t) * t, Math.round(e[1] / t) * t];
}
function Y(e) {
  return [Math.round(e[0] * 10) / 10, Math.round(e[1] * 10) / 10];
}
function ze(e, t, n, s) {
  const i = t / 2, r = n / 2;
  return [
    [-i, -r],
    [i, -r],
    [i, r],
    [-i, r]
  ].map((a) => P([e[0] + a[0], e[1] + a[1]], s, e));
}
function Ye(e) {
  const t = e.x0 ?? 0, n = e.y0 ?? 0;
  return e.zellen.map(([s, i]) => ({ x: t + s * e.groesse, y: n + i * e.groesse, s: e.groesse }));
}
function Qe(e, t, n = 0, s = 0) {
  return [Math.floor((e[0] - n) / t), Math.floor((e[1] - s) / t)];
}
function j(e) {
  if (e.art === "vieleck") return e.punkte;
  if (e.art === "rechteck") return ze(e.mitte, e.breite, e.tiefe, e.winkel);
  const t = Ye(e), n = t.flatMap((h) => [h.x, h.x + h.s]), s = t.flatMap((h) => [h.y, h.y + h.s]);
  if (!n.length) return [];
  const [i, r, a, o] = [Math.min(...n), Math.max(...n), Math.min(...s), Math.max(...s)];
  return [
    [i, a],
    [r, a],
    [r, o],
    [i, o]
  ];
}
function Wt([e, t], n) {
  let s = !1;
  for (let i = 0, r = n.length - 1; i < n.length; r = i++) {
    const [a, o] = n[i], [h, l] = n[r];
    o > t != l > t && e < a + (t - o) * (h - a) / (l - o) && (s = !s);
  }
  return s;
}
function He(e, t) {
  if (t.art === "zellen") {
    const [n, s] = Qe(e, t.groesse, t.x0 ?? 0, t.y0 ?? 0);
    return t.zellen.some(([i, r]) => i === n && r === s);
  }
  return Wt(e, j(t));
}
function vn(e) {
  if (!e.length) return [0, 0];
  let t = 0, n = 0, s = 0;
  for (let i = 0, r = e.length - 1; i < e.length; r = i++) {
    const [a, o] = e[r], [h, l] = e[i], c = a * l - h * o;
    t += c, n += (a + h) * c, s += (o + l) * c;
  }
  return Math.abs(t) < 1e-9 ? [e.reduce((i, r) => i + r[0], 0) / e.length, e.reduce((i, r) => i + r[1], 0) / e.length] : [n / (3 * t), s / (3 * t)];
}
function T(e) {
  if (e.art === "rechteck") return e.mitte;
  if (e.art === "zellen") {
    const t = Ye(e), n = t.length || 1;
    return [t.reduce((s, i) => s + i.x + i.s / 2, 0) / n, t.reduce((s, i) => s + i.y + i.s / 2, 0) / n];
  }
  return vn(e.punkte);
}
function xn(e) {
  let t = 0;
  for (let n = 0, s = e.length - 1; n < e.length; s = n++)
    t += e[s][0] * e[n][1] - e[n][0] * e[s][1];
  return Math.abs(t) / 2;
}
function xe(e, t, n) {
  return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function wn(e) {
  const t = e.length;
  for (let n = 0; n < t; n++)
    for (let s = n + 1; s < t; s++) {
      if (Math.abs(n - s) === 1 || Math.abs(n - s) === t - 1) continue;
      const [i, r] = [e[n], e[(n + 1) % t]], [a, o] = [e[s], e[(s + 1) % t]];
      if (xe(i, r, a) * xe(i, r, o) < 0 && xe(a, o, i) * xe(a, o, r) < 0) return !0;
    }
  return !1;
}
function je(e) {
  return e.art === "zellen" ? e.zellen.length ? "" : "Keine Zelle gewählt" : e.art === "rechteck" ? e.breite > 0 && e.tiefe > 0 ? "" : "Rechteck ohne Fläche" : e.punkte.length < 3 ? "Mindestens drei Ecken" : wn(e.punkte) ? "Kanten überschneiden sich" : xn(e.punkte) < 1 ? "Vieleck ohne Fläche" : "";
}
function Ce(e, t, n) {
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map((r) => Y([r[0] + t, r[1] + n])) };
  if (e.art === "rechteck") return { ...e, mitte: Y([e.mitte[0] + t, e.mitte[1] + n]) };
  const s = Math.round(t / e.groesse), i = Math.round(n / e.groesse);
  return { ...e, zellen: e.zellen.map(([r, a]) => [r + s, a + i]) };
}
function _e(e) {
  const t = Dt(e);
  return [-Math.sin(t), Math.cos(t)];
}
function Ie(e, t, n, s, i = 36) {
  const r = [];
  s >= 360 || r.push(e);
  const o = t - s / 2;
  for (let h = 0; h <= i; h++) {
    const l = o + s * h / i, [c, d] = _e(l);
    r.push([e[0] + c * n, e[1] + d * n]);
  }
  return r;
}
function yn(e, t) {
  const n = P(e, t.winkel);
  return [t.x + n[0], t.y + n[1]];
}
function we(e, t) {
  const n = Math.atan2(-(t[0] - e[0]), t[1] - e[1]) * 180 / Math.PI;
  return Math.round(n * 10) / 10;
}
function Oe(e, t, n) {
  const s = n[0] - t[0], i = n[1] - t[1], r = s * s + i * i;
  if (r === 0) return Fe(e, t);
  const a = Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r));
  return Fe(e, [t[0] + a * s, t[1] + a * i]);
}
function Ft(e, t) {
  return P([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function zn(e, t, n) {
  const s = (i) => Y(yn(Ft(i, t), n));
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map(s) };
  if (e.art === "rechteck") {
    let i = e.winkel + n.winkel - t.winkel;
    return i > 180 && (i -= 360), i <= -180 && (i += 360), { ...e, mitte: s(e.mitte), winkel: Math.round(i * 10) / 10 };
  }
  return t.winkel !== n.winkel ? e : Ce(e, n.x - t.x, n.y - t.y);
}
function Z(e, t) {
  const [n, s] = P(e, t.winkel);
  return [n + t.x, s + t.y];
}
function _n(e, t) {
  return P([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function Mn(e, t, n) {
  if (e.length >= 3) return e;
  const s = [n];
  for (const d of t) s.push(...j(d));
  const i = s.map((d) => d[0]), r = s.map((d) => d[1]), a = 40, [o, h] = [Math.min(...i) - a, Math.max(...i) + a], [l, c] = [Math.min(...r) - a, Math.max(...r) + a];
  return [
    [o, l],
    [h, l],
    [h, c],
    [o, c]
  ];
}
function Sn(e, t = 100) {
  const n = {};
  let s = -1 / 0;
  for (const i of e)
    if (i.lage) {
      n[i.id] = i.lage;
      for (const r of i.outline) s = Math.max(s, Z(r, i.lage)[0]);
    }
  s === -1 / 0 && (s = -t);
  for (const i of e) {
    if (i.lage) continue;
    const r = Math.min(...i.outline.map((h) => h[0])), a = Math.max(...i.outline.map((h) => h[0])), o = { x: s + t - r, y: 0, winkel: 0 };
    n[i.id] = o, s = o.x + a;
  }
  return n;
}
const jt = {
  normal: "normal",
  ausgang: "ausgang",
  hundeplatz: "hundeplatz",
  stoerquelle: "stoerquelle",
  stelle: "stelle",
  durchgang: "durchgang"
};
class An {
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
function Ct(e, t) {
  const n = new Set(t.map((i) => i.name));
  if (!n.has(e)) return e;
  let s = 2;
  for (; n.has(`${e} ${s}`); ) s++;
  return `${e} ${s}`;
}
function pt(e, t, n, s = "normal") {
  return {
    name: Ct("Zone", t),
    art: s,
    form: e,
    regel: { ...n[jt[s]] }
  };
}
function Rn(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s[t] = Y(n), { ...e, punkte: s };
}
function mt(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s.splice(t + 1, 0, Y(n)), { ...e, punkte: s };
}
function Tn(e, t) {
  return e.art !== "vieleck" || e.punkte.length <= 3 ? e : { ...e, punkte: e.punkte.filter((n, s) => s !== t) };
}
function ft(e, t, n) {
  const [s, i] = Qe(t, e.groesse, e.x0 ?? 0, e.y0 ?? 0), r = e.zellen.some(([a, o]) => a === s && o === i);
  return n && !r ? { ...e, zellen: [...e.zellen, [s, i]] } : !n && r ? { ...e, zellen: e.zellen.filter(([a, o]) => a !== s || o !== i) } : e;
}
function gt(e, t) {
  return {
    art: "rechteck",
    mitte: Y([(e[0] + t[0]) / 2, (e[1] + t[1]) / 2]),
    breite: Math.round(Math.abs(t[0] - e[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(t[1] - e[1]) * 10) / 10,
    winkel: 0
  };
}
function bt(e) {
  for (const t of e) {
    if (!t.name.trim()) return "Eine Zone hat keinen Namen";
    const n = je(t.form);
    if (n) return `${t.name}: ${n}`;
  }
  return "";
}
function En(e, t, n) {
  const s = e.name.toLowerCase(), i = s.includes("bett"), a = s.includes("tür") || s.includes("tuer") || s.includes("door") ? "ausgang" : "normal";
  return {
    name: Ct(e.name, t),
    art: a,
    form: e.form,
    regel: { ...n[i ? "bett" : jt[a]] }
  };
}
const Ue = [
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
function Me(e) {
  return Ue.find((t) => t.rolle === e) ?? Ue[1];
}
function he(e) {
  return e.art === "ausgang" ? "tuer" : e.art === "hundeplatz" ? "hund" : e.art === "stelle" ? "stelle" : e.art === "durchgang" ? "durchgang" : e.art === "stoerquelle" ? "ignorieren" : e.regel.schlaefer_halten ? "bett" : "bereich";
}
function $t(e, t, n) {
  const s = Me(t), i = { ...e, art: s.art, regel: { ...n[s.vorlage] } };
  return s.art !== "ausgang" && delete i.fuehrt_zu, i;
}
function kt(e) {
  return e === 0 ? "sofort" : `nach ${String(e).replace(".", ",")} s`;
}
function vt(e) {
  const t = e.regel;
  if (e.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const n = [`belegt ${kt(t.belegt_nach_s)}`, `frei ${kt(t.frei_nach_s)}`];
  t.schlaefer_halten && n.push("hält Schläfer"), t.max_personen === 1 && n.push("eine Person"), t.hund_ignorieren && n.push("ohne Hund");
  const s = n.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}
function Pn(e, t, n, s = 10) {
  const i = e.breite / 2, r = e.tiefe / 2, a = [
    t === 0 || t === 3 ? e.mitte[0] + i : e.mitte[0] - i,
    t === 0 || t === 1 ? e.mitte[1] + r : e.mitte[1] - r
  ], o = Math.max(s, Math.abs(n[0] - a[0])), h = Math.max(s, Math.abs(n[1] - a[1])), l = n[0] >= a[0] ? 1 : -1, c = n[1] >= a[1] ? 1 : -1;
  return {
    ...e,
    winkel: 0,
    breite: Math.round(o * 10) / 10,
    tiefe: Math.round(h * 10) / 10,
    mitte: Y([a[0] + l * o / 2, a[1] + c * h / 2])
  };
}
function Ln(e, t) {
  const n = e.fuehrt_zu ?? "";
  return n ? n === "aussen" ? "nach draußen oder in einen Raum ohne Sensor" : t.find((s) => s.id === n)?.name ?? "unbekannter Raum" : "noch nicht eingetragen";
}
function Zn(e) {
  let t = (e % 360 + 540) % 360 - 180;
  return t === -180 && (t = 180), t;
}
const Ne = (e) => Math.round(e * 10) / 10 + 0;
function xt(e, t, n) {
  return e.art === "vieleck" ? { ...e, punkte: e.punkte.map((s) => P(s, n, t).map((i) => Ne(i))) } : e.art === "rechteck" ? { ...e, mitte: P(e.mitte, n, t).map((s) => Ne(s)), winkel: Ne(Zn(e.winkel + n)) } : e;
}
function te(e) {
  return e.map((t, n) => {
    const s = e[(n + 1) % e.length];
    return [(t[0] + s[0]) / 2, (t[1] + s[1]) / 2];
  });
}
function Le(e, t) {
  return [e[t], e[(t + 1) % e.length]];
}
function fe(e, t, n) {
  const [s, i] = Le(e, t), r = i[0] - s[0], a = i[1] - s[1], o = Math.hypot(r, a);
  if (!o) return 0;
  const h = ((n[0] - s[0]) * r + (n[1] - s[1]) * a) / o;
  return Math.max(0, Math.min(o, h));
}
function Hn(e, t, n, s, i = 20) {
  const [r, a] = Le(e, t), o = Math.hypot(a[0] - r[0], a[1] - r[1]);
  let h = Math.round(fe(e, t, n) / 5) * 5, l = Math.round(fe(e, t, s) / 5) * 5;
  return l < h && ([h, l] = [l, h]), l - h < i ? null : { kante: t, von: h, bis: Math.min(l, Math.floor(o)), art: "tuer" };
}
function ce(e, t) {
  const [n, s] = Le(e, t.kante), i = Math.hypot(s[0] - n[0], s[1] - n[1]) || 1, r = (a) => [n[0] + (s[0] - n[0]) * a / i, n[1] + (s[1] - n[1]) * a / i];
  return [r(t.von), r(t.bis)];
}
function wt(e, t, n) {
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
function In(e, t, n = 20) {
  const s = [];
  for (const i of t) {
    if (i.kante >= e.length) continue;
    const [r, a] = Le(e, i.kante), o = Math.floor(Math.hypot(a[0] - r[0], a[1] - r[1])), h = Math.min(i.bis, o);
    h - i.von >= n && s.push({ ...i, bis: h });
  }
  return s;
}
const On = Gt`
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
  /* Assistent Sensor umsetzen */
  .wiz-marke circle {
    fill: var(--card);
    stroke: var(--accent);
    stroke-width: 2;
  }
  .wiz-marke.aktiv circle {
    fill: color-mix(in srgb, var(--accent) 25%, var(--card));
    stroke-width: 3;
  }
  .wiz-marke text {
    text-anchor: middle;
    font-size: 14px;
    font-weight: 700;
    fill: var(--primary-text-color);
  }
  .wiz-marke,
  .wiz-neu {
    pointer-events: none;
  }
  .wiz-neu circle {
    fill: var(--ok);
  }
  .wiz-neu line {
    stroke: var(--ok);
    stroke-width: 3;
  }
  .wiz-stellen {
    display: flex;
    gap: 12px;
    padding: 0;
    margin: 6px 0;
    list-style: none;
    font-size: 13px;
    color: var(--muted);
  }
  .wiz-stellen .aktiv {
    color: var(--primary-text-color);
    font-weight: 600;
  }
  .wiz-stellen .fertig {
    color: var(--ok);
  }
  /* Grundriss übernehmen */
  .plan-vorschau {
    width: 100%;
    height: auto;
    border: 2px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
  }
  .plan-raum {
    fill: color-mix(in srgb, var(--muted) 18%, transparent);
    stroke: var(--muted);
    stroke-width: 6;
  }
  .plan-raum.on {
    fill: color-mix(in srgb, var(--rz-bereich) 25%, transparent);
    stroke: var(--rz-bereich);
  }
  circle.plan-nr {
    fill: var(--card);
    stroke: var(--primary-text-color);
    stroke-width: 4;
  }
  text.plan-nr {
    text-anchor: middle;
    font-weight: 700;
    fill: var(--primary-text-color);
  }
  .plan-vorschau {
    cursor: crosshair;
  }
  .plan-strecke {
    fill: var(--accent);
    stroke: var(--accent);
  }
  .mass-text {
    text-anchor: middle;
    font-size: 12px;
    font-weight: 600;
    fill: var(--primary-text-color);
    paint-order: stroke;
    stroke: var(--card);
    stroke-width: 3px;
    pointer-events: none;
  }
  .mass-text.klein {
    font-size: 11px;
    fill: var(--rz-tuer);
  }
  .door-name {
    font-weight: 500;
  }
  .door-felder {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }
  .melder-erfassung {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  .plan-bilder {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    margin: 8px 0;
  }
  .plan-bild-wahl {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border: 2px solid var(--divider-color);
    border-radius: 8px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    cursor: pointer;
    font: inherit;
  }
  .plan-bild-wahl:hover {
    border-color: var(--primary-color);
  }
  .plan-bild-wahl img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    border-radius: 4px;
  }
  .plan-strecke-linie {
    stroke: var(--accent);
    stroke-width: 3;
    pointer-events: none;
  }
  circle.plan-strecke {
    pointer-events: none;
  }
  .plan-rahmen {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2;
    stroke-dasharray: 8 6;
    pointer-events: none;
  }
  image.plan-hintergrund.edit {
    opacity: 0.7;
  }
  image.plan-hintergrund {
    pointer-events: none;
    opacity: 0.45;
  }
  .plan-luecke {
    stroke: var(--muted);
    stroke-dasharray: 20 14;
  }
  .plan-luecke.tuer,
  .plan-luecke.offen {
    stroke: var(--rz-tuer);
    stroke-dasharray: none;
  }
  .mass {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }
  .mass .field {
    width: 120px;
    margin: 0;
  }
  .row.luecke {
    padding: 2px 8px 2px 30px;
  }
  .file-knopf {
    position: relative;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--accent);
    font-weight: 500;
    font-size: 13px;
    padding: 4px 10px;
    border-radius: var(--radius);
  }
  .file-knopf:hover {
    background: color-mix(in srgb, currentColor 10%, transparent);
  }
  .neu-raum .row select,
  .mass select {
    width: auto;
    max-width: 55%;
    flex: 0 1 auto;
  }
  .neu-raum .row .name {
    flex: 1 1 auto;
  }
  .file-knopf input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  /* Stockwerke */
  .levels.stockwerke {
    margin: 4px 0 10px;
  }
  .stockwerk-wahl {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
  }
  .stockwerk-wahl .check {
    margin: 2px 0;
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
  .melder-aktionen {
    margin: 0 0 6px 30px;
  }
  .melder-punkt {
    fill: var(--rz-bereich);
    stroke: var(--card);
    stroke-width: 2;
  }
  .melder-liste .gruppe {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    margin: 8px 0 2px;
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
`, yt = 600;
function Nn(e) {
  const t = Math.max(1, Math.ceil(e * 3)), n = new Float32Array(2 * t + 1);
  let s = 0;
  for (let i = -t; i <= t; i++) {
    const r = Math.exp(-(i * i) / (2 * e * e));
    n[i + t] = r, s += r;
  }
  for (let i = 0; i < n.length; i++) n[i] /= s;
  return n;
}
function zt(e, t, n = 8) {
  if (!e.length || !(t > 0)) return null;
  let s = 1 / 0, i = -1 / 0, r = 1 / 0, a = -1 / 0;
  for (const [$, k] of e)
    s = Math.min(s, $), i = Math.max(i, $), r = Math.min(r, k), a = Math.max(a, k);
  const o = Math.max(0.6, n / t), h = Nn(o), l = (h.length - 1) / 2;
  s -= l, r -= l;
  const c = Math.min(yt, i - s + 1 + l), d = Math.min(yt, a - r + 1 + l), g = new Float32Array(c * d);
  for (const [$, k, _] of e) {
    const w = $ - s, M = k - r;
    w >= 0 && w < c && M >= 0 && M < d && _ > 0 && (g[M * c + w] += _);
  }
  const p = new Float32Array(c * d);
  for (let $ = 0; $ < d; $++)
    for (let k = 0; k < c; k++) {
      const _ = g[$ * c + k];
      if (_)
        for (let w = -l; w <= l; w++) {
          const M = k + w;
          M >= 0 && M < c && (p[$ * c + M] += _ * h[w + l]);
        }
    }
  const f = new Float32Array(c * d);
  let b = 0;
  for (let $ = 0; $ < d; $++)
    for (let k = 0; k < c; k++) {
      const _ = p[$ * c + k];
      if (_)
        for (let w = -l; w <= l; w++) {
          const M = $ + w;
          M >= 0 && M < d && (f[M * c + k] += _ * h[w + l]);
        }
    }
  for (let $ = 0; $ < f.length; $++) b = Math.max(b, f[$]);
  return { x0: s * t, y0: r * t, zelle: t, nx: c, ny: d, werte: f, max: b };
}
function Bn(e, t, n = 0.2) {
  return !(e > n) || !(t > 0) ? 0 : Math.min(1, Math.log1p(e) / Math.log1p(t));
}
function Dn(e, t, n = 0.85) {
  const s = new Uint8ClampedArray(e.nx * e.ny * 4);
  for (let i = 0; i < e.ny; i++) {
    const r = e.ny - 1 - i;
    for (let a = 0; a < e.nx; a++) {
      const o = Bn(e.werte[i * e.nx + a], e.max);
      if (!o) continue;
      const h = (r * e.nx + a) * 4;
      s[h] = t[0], s[h + 1] = t[1], s[h + 2] = t[2], s[h + 3] = Math.round(255 * n * (0.15 + 0.85 * o));
    }
  }
  return s;
}
function _t(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e)
    for (const [s, i, r] of n) {
      const a = `${s},${i}`, o = t.get(a);
      o ? o[2] += r : t.set(a, [s, i, r]);
    }
  return [...t.values()];
}
function ue(e) {
  if (e < 60) return `${Math.round(e)} s`;
  const t = Math.round(e / 60);
  if (t < 60) return `${t} min`;
  const n = Math.floor(t / 60), s = t % 60;
  return s ? `${n} h ${s} min` : `${n} h`;
}
function Wn(e, t = 300, n = 0.2, s = 15) {
  const { nx: i, ny: r, werte: a } = e, o = e.max * n, h = new Uint8Array(i * r), l = [];
  for (let c = 0; c < i * r; c++) {
    if (h[c] || a[c] < o) continue;
    const d = [c];
    h[c] = 1;
    let [g, p, f, b, $] = [1 / 0, -1 / 0, 1 / 0, -1 / 0, 0];
    for (; d.length; ) {
      const w = d.pop(), M = w % i, A = w / i | 0;
      g = Math.min(g, M), p = Math.max(p, M), f = Math.min(f, A), b = Math.max(b, A), $ += a[w];
      for (const S of [M > 0 ? w - 1 : -1, M < i - 1 ? w + 1 : -1, w - i, w + i])
        S < 0 || S >= i * r || h[S] || a[S] < o || (h[S] = 1, d.push(S));
    }
    if ($ < t) continue;
    const k = (p - g + 1) * e.zelle + 2 * s, _ = (b - f + 1) * e.zelle + 2 * s;
    l.push({
      mitte: [Math.round(e.x0 + (g + p + 1) / 2 * e.zelle), Math.round(e.y0 + (f + b + 1) / 2 * e.zelle)],
      breite: Math.round(k),
      tiefe: Math.round(_),
      sekunden: Math.round($)
    });
  }
  return l.sort((c, d) => d.sekunden - c.sekunden);
}
function E(e) {
  const t = e;
  return t?.code === "unknown_command" ? Fn : t?.message ?? String(e);
}
const Fn = "Raumzonen wurde aktualisiert und wartet auf einen Neustart von Home Assistant (Einstellungen → System → Neu starten).";
function jn(e, t, n) {
  return `${e}/#${t.id || n}`;
}
function Se(e, t) {
  return e.name?.trim() || (e.art === "offen" ? `Durchgang ${t + 1}` : `Tür ${t + 1}`);
}
function Be(e, t, n, s = 150) {
  const i = e.find((o) => o.id === t);
  if (!i?.haus_gesetzt) return null;
  const r = Z(n, { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel });
  let a = null;
  for (const o of e)
    if (!(o.id === t || !o.haus_gesetzt))
      for (const h of N(o)) {
        const [l, c] = Z(h.punkt, { x: o.haus_x, y: o.haus_y, winkel: o.haus_winkel }), d = Math.hypot(l - r[0], c - r[1]);
        d <= s && (!a || d < a.abstand) && (a = { tuer: h, abstand: d });
      }
  return a;
}
function et(e, t) {
  const n = e.length;
  if (n < 3 || t.kante < 0 || t.kante >= n) return null;
  const [s, i] = e[t.kante], [r, a] = e[(t.kante + 1) % n], o = Math.hypot(r - s, a - i);
  if (!o) return null;
  const h = (t.von + t.bis) / 2 / o;
  return [s + (r - s) * h, i + (a - i) * h];
}
function N(e) {
  const t = [];
  for (const n of e.zonen)
    n.art !== "ausgang" || !n.id || t.push({ key: `${e.id}/${n.id}`, raumId: e.id, name: n.name, punkt: T(n.form), ziel: n.fuehrt_zu ?? "", gegenstueck: n.gegenstueck ?? "", zoneId: n.id });
  return (e.oeffnungen ?? []).forEach((n, s) => {
    const i = et(e.umriss, n);
    i && t.push({ key: jn(e.id, n, s), raumId: e.id, name: Se(n, s), punkt: i, ziel: n.fuehrt_zu ?? "", gegenstueck: n.gegenstueck ?? "", oeffnung: s });
  }), t;
}
function Cn(e, t = 60) {
  const n = e.flat().filter(([i, r]) => r > i).sort((i, r) => i[0] - r[0]), s = [];
  for (const [i, r] of n) {
    const a = s[s.length - 1];
    a && i - a[1] <= t ? a[1] = Math.max(a[1], r) : s.push([i, r]);
  }
  return s;
}
function Un(e) {
  return e.reduce((t, [n, s]) => t + (s - n), 0);
}
function Vn(e, t = 30) {
  const n = [], s = [];
  for (const [r, a] of Object.entries(e))
    for (const [o, h] of a)
      s.push({ t: o, raum: r }), n.push({ t: h, raum: r });
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
function Gn(e, t, n = 60) {
  const s = e.length;
  if (s < 3 || t.kante < 0 || t.kante >= s) return null;
  const [i, r] = e[t.kante], [a, o] = e[(t.kante + 1) % s], h = Math.hypot(a - i, o - r);
  if (!h) return null;
  const [l, c] = [(a - i) / h, (o - r) / h], d = (t.von + t.bis) / 2, g = [i + l * d, r + c * d];
  let [p, f] = [-c, l];
  return Wt([g[0] + p * 5, g[1] + f * 5], e) || ([p, f] = [-p, -f]), {
    art: "rechteck",
    mitte: [Math.round(g[0] + p * n / 2), Math.round(g[1] + f * n / 2)],
    breite: Math.round(t.bis - t.von),
    tiefe: n,
    winkel: Math.round(Math.atan2(c, l) * 180 / Math.PI)
  };
}
function Kn(e, t, n = 80) {
  const s = et(e.umriss, t);
  return s ? e.zonen.some((i) => i.art === "ausgang" && j(i.form).length && Math.hypot(T(i.form)[0] - s[0], T(i.form)[1] - s[1]) <= n) : !0;
}
function Mt(e) {
  if (e.length < 3) return "Es braucht drei Stellen.";
  let t = 1 / 0;
  for (let a = 0; a < e.length; a++)
    for (let o = a + 1; o < e.length; o++) t = Math.min(t, Math.hypot(e[a][0] - e[o][0], e[a][1] - e[o][1]));
  const [n, s, i] = e, r = Math.abs((s[0] - n[0]) * (i[1] - n[1]) - (i[0] - n[0]) * (s[1] - n[1])) / 2;
  return t < 100 ? "Zwei Stellen liegen zu nah beieinander (weniger als 1 m). Weiter auseinander gehen." : r < 5e3 ? "Die drei Stellen liegen fast auf einer Linie. Eine Stelle seitlich wählen." : "";
}
function qn(e, t) {
  const n = Math.min(e.length, t.length);
  if (n < 2) return null;
  const s = (b) => [b.reduce(($, k) => $ + k[0], 0) / n, b.reduce(($, k) => $ + k[1], 0) / n], i = s(e.slice(0, n)), r = s(t.slice(0, n));
  let a = 0, o = 0;
  for (let b = 0; b < n; b++) {
    const [$, k] = [e[b][0] - i[0], e[b][1] - i[1]], [_, w] = [t[b][0] - r[0], t[b][1] - r[1]];
    a += $ * w - k * _, o += $ * _ + k * w;
  }
  if (!a && !o) return null;
  const h = Math.atan2(a, o), [l, c] = [Math.cos(h), Math.sin(h)], d = r[0] - (i[0] * l - i[1] * c), g = r[1] - (i[0] * c + i[1] * l);
  let p = 0;
  for (let b = 0; b < n; b++) {
    const $ = d + e[b][0] * l - e[b][1] * c, k = g + e[b][0] * c + e[b][1] * l;
    p += Math.hypot($ - t[b][0], k - t[b][1]);
  }
  let f = h * 180 / Math.PI;
  return f = Math.round(f * 10) / 10, f <= -180 && (f += 360), { x: Math.round(d), y: Math.round(g), winkel: f, rest_cm: Math.round(p / n * 10) / 10 };
}
function Xn(e) {
  if (!e.length) return null;
  const t = (i) => {
    const r = [...i].sort((o, h) => o - h), a = r.length >> 1;
    return r.length % 2 ? r[a] : (r[a - 1] + r[a]) / 2;
  }, n = [t(e.map((i) => i[0])), t(e.map((i) => i[1]))], s = e.map((i) => Math.hypot(i[0] - n[0], i[1] - n[1]));
  return { punkt: [Math.round(n[0] * 10) / 10, Math.round(n[1] * 10) / 10], streuung_cm: Math.round(t(s) * 10) / 10 };
}
function Jn(e) {
  const t = new TextEncoder().encode("endstream"), n = [];
  for (let s = 0; s < e.length - 3; s++) {
    if (e[s] !== 255 || e[s + 1] !== 216 || e[s + 2] !== 255) continue;
    let i = s + 3;
    e: for (; i < e.length - t.length; i++) {
      for (let a = 0; a < t.length; a++) if (e[i + a] !== t[a]) continue e;
      break;
    }
    let r = i;
    for (; r > s && !(e[r - 2] === 255 && e[r - 1] === 217); ) r--;
    r > s && n.push(e.subarray(s, r)), s = i;
  }
  return n;
}
function Yn(e, t) {
  const n = Math.floor(e.width / t), s = Math.floor(e.height / t), i = new Uint8Array(n * s), r = new Uint8Array(n * s), a = e.data;
  for (let h = 0; h < s; h++)
    for (let l = 0; l < n; l++) {
      let c = 0, d = 0;
      for (let g = 0; g < t; g++)
        for (let p = 0; p < t; p++) {
          const f = ((h * t + g) * e.width + (l * t + p)) * 4, [b, $, k] = [a[f], a[f + 1], a[f + 2]];
          k > b + 40 && k > $ + 10 && k > 120 && (c = 1), b + $ + k < 270 && (d = 1);
        }
      i[h * n + l] = c, r[h * n + l] = d;
    }
  const o = new Uint8Array(n * s);
  for (let h = 1; h < s - 1; h++)
    for (let l = 1; l < n - 1; l++)
      if (i[h * n + l]) for (let c = -1; c <= 1; c++) for (let d = -1; d <= 1; d++) o[(h + c) * n + l + d] = 1;
  return { w: n, h: s, blau: o, dunkel: r };
}
function Qn(e) {
  const { w: t, h: n, blau: s } = e, i = new Int32Array(t * n).fill(-1), r = new Int32Array(t * n);
  let a = 0;
  for (let o = 0; o < t * n; o++) {
    if (s[o] || i[o] >= 0) continue;
    let h = 0;
    for (r[h++] = o, i[o] = a; h; ) {
      const l = r[--h], c = l % t, d = [c > 0 ? l - 1 : -1, c < t - 1 ? l + 1 : -1, l - t, l + t];
      for (const g of d)
        g < 0 || g >= t * n || s[g] || i[g] >= 0 || (i[g] = a, r[h++] = g);
    }
    a++;
  }
  return { label: i, anzahl: a };
}
function es(e, t, n, s) {
  const i = (g, p) => g >= 0 && p >= 0 && g < t && p < n && e[p * t + g] === s;
  let r = -1, a = -1;
  for (let g = 0; g < t * n; g++)
    if (e[g] === s) {
      r = g % t, a = Math.floor(g / t);
      break;
    }
  if (r < 0) return [];
  const o = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1]
  ], h = [[r, a]];
  let [l, c] = [r, a], d = 7;
  for (let g = 0; g < t * n * 2; g++) {
    let p = !1;
    for (let f = 0; f < 8; f++) {
      const b = (d + 6 + f) % 8, [$, k] = [l + o[b][0], c + o[b][1]];
      if (i($, k)) {
        l = $, c = k, d = b, p = !0;
        break;
      }
    }
    if (!p || l === r && c === a) break;
    h.push([l, c]);
  }
  return h;
}
function Ut(e, t, n) {
  const [s, i] = [n[0] - t[0], n[1] - t[1]], r = s * s + i * i, a = r ? Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r)) : 0;
  return Math.hypot(e[0] - t[0] - a * s, e[1] - t[1] - a * i);
}
function Te(e, t) {
  if (e.length < 3) return e;
  let n = 0, s = 0;
  for (let a = 1; a < e.length - 1; a++) {
    const o = Ut(e[a], e[0], e[e.length - 1]);
    o > n && (n = o, s = a);
  }
  if (n <= t) return [e[0], e[e.length - 1]];
  const i = Te(e.slice(0, s + 1), t), r = Te(e.slice(s), t);
  return [...i.slice(0, -1), ...r];
}
function ts(e, t) {
  if (e.length < 4) return e;
  let n = 0, s = 0;
  for (let o = 1; o < e.length; o++) {
    const h = Math.hypot(e[o][0] - e[0][0], e[o][1] - e[0][1]);
    h > s && (s = h, n = o);
  }
  const i = Te(e.slice(0, n + 1), t), r = Te([...e.slice(n), e[0]], t);
  let a = [...i.slice(0, -1), ...r.slice(0, -1)];
  for (let o = !0; o && a.length > 3; ) {
    o = !1;
    for (let h = 0; h < a.length; h++) {
      const l = a[(h - 1 + a.length) % a.length], c = a[(h + 1) % a.length];
      if (Math.hypot(l[0] - c[0], l[1] - c[1]) < t * 3 && Math.hypot(a[h][0] - l[0], a[h][1] - l[1]) > t * 3 || Ut(a[h], l, c) < t) {
        a = a.filter((g, p) => p !== h), o = !0;
        break;
      }
    }
  }
  return a;
}
function ns(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const [s, i] = e[n], [r, a] = e[(n + 1) % e.length];
    t += s * a - r * i;
  }
  return Math.abs(t) / 2;
}
function ss(e, t = 2) {
  const n = Yn(e, t), { w: s, h: i } = n, { label: r, anzahl: a } = Qn(n), o = new Int32Array(a), h = new Uint8Array(a), l = new Int32Array(a);
  for (let w = 0; w < s * i; w++) {
    const M = r[w];
    if (M < 0) continue;
    o[M]++, n.dunkel[w] && l[M]++;
    const A = w % s, S = w / s | 0;
    (A === 0 || S === 0 || A === s - 1 || S === i - 1) && (h[M] = 1);
  }
  const c = s * i * 0.015, d = [];
  for (let w = 0; w < a; w++)
    h[w] || o[w] < c || l[w] > o[w] * 0.3 || d.push(w);
  const g = Math.max(2, Math.hypot(s, i) * 6e-3), p = [], f = /* @__PURE__ */ new Map();
  for (const w of d) {
    const M = ts(es(r, s, i, w), g);
    M.length < 3 || (f.set(w, p.length), p.push({ punkte: M.map(([A, S]) => [(A + 0.5) * t, (S + 0.5) * t]), flaeche_px: ns(M) * t * t }));
  }
  const b = Math.max(4, Math.round(16 / t)), $ = Math.max(6, Math.round(40 / t)), k = Math.max(2, Math.round(6 / t)), _ = [];
  return p.forEach((w, M) => {
    const A = w.punkte.map(([S, L]) => [S / t, L / t]);
    A.forEach((S, L) => {
      const I = A[(L + 1) % A.length], B = Math.hypot(I[0] - S[0], I[1] - S[1]);
      if (B < $) return;
      const [ae, Q] = [(I[0] - S[0]) / B, (I[1] - S[1]) / B], [oe, D] = [-Q, ae];
      let W = -1;
      const tt = (O) => {
        if (W >= 0 && O - W >= $ && W > 2 && O < B - 2) {
          const C = (W + O) / 2;
          let ee = null;
          for (const U of [1, -1]) {
            const V = Math.round(S[0] + ae * C + oe * U * b * 2.5), G = Math.round(S[1] + Q * C + D * U * b * 2.5);
            if (V < 0 || G < 0 || V >= s || G >= i) continue;
            const ve = f.get(r[G * s + V]);
            ve !== void 0 && ve !== M && (ee = ve);
          }
          _.push({ raum: M, kante: L, von_px: W * t, bis_px: O * t, partner: ee });
        }
        W = -1;
      };
      for (let O = 0; O <= B; O++) {
        let C = !1, ee = 0;
        for (let U = -b; U <= b && !C; U++) {
          const V = Math.round(S[0] + ae * O + oe * U), G = Math.round(S[1] + Q * O + D * U);
          ee = V >= 0 && G >= 0 && V < s && G < i && n.dunkel[G * s + V] ? ee + 1 : 0, ee >= k && (C = !0);
        }
        !C && W < 0 && (W = O), C && W >= 0 && tt(O);
      }
      tt(B);
    });
  }), { breite: e.width, hoehe: e.height, raeume: p, luecken: _ };
}
function se(e) {
  const t = e.map((s) => s[0]), n = e.map((s) => s[1]);
  return { x0: Math.min(...t), y0: Math.min(...n), x1: Math.max(...t), y1: Math.max(...n) };
}
function St(e, t, n, s = [0, 0]) {
  const i = e.raeume[t], r = se(i.punkte), a = ([f, b]) => [Math.round((f - r.x0) * n + s[0]), Math.round((r.y1 - b) * n + s[1])];
  let o = i.punkte.map(a);
  const h = i.punkte.map((f, b) => b);
  let l = 0;
  o.forEach((f, b) => {
    f[0] + f[1] < o[l][0] + o[l][1] && (l = b);
  }), o = [...o.slice(l), ...o.slice(0, l)];
  const c = [...h.slice(l), ...h.slice(0, l)], d = o.length, g = [];
  e.luecken.forEach((f, b) => {
    if (f.raum !== t) return;
    const $ = c.indexOf(f.kante);
    if ($ < 0) return;
    const k = o[$], _ = o[($ + 1) % d], w = Math.hypot(_[0] - k[0], _[1] - k[1]), M = Math.max(0, Math.round(f.von_px * n)), A = Math.min(Math.floor(w), Math.round(f.bis_px * n));
    A - M >= 30 && g.push({ kante: $, von: M, bis: A, luecke: b });
  });
  const p = { x: Math.round(r.x0 * n - s[0]), y: Math.round((e.hoehe - r.y1) * n - s[1]), winkel: 0 };
  return { umriss: o, haus: p, luecken: g };
}
var is = Object.defineProperty, rs = Object.getOwnPropertyDescriptor, y = (e, t, n, s) => {
  for (var i = s > 1 ? void 0 : s ? rs(t, n) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (i = (s ? a(t, n, i) : a(i)) || i);
  return s && i && is(t, n, i), i;
};
const R = "raumzonen", as = 5, H = 12, os = 8, ls = 30, At = [1, 3, 8, 12, 24], hs = ["auswahl", "rechteck", "vieleck", "zellen", "umriss", "oeffnung"], q = "anwesenheit", Rt = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" }
], cs = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung."
};
function De(e, t) {
  try {
    const n = localStorage.getItem(e);
    return n === null ? t : n === "1";
  } catch {
    return t;
  }
}
function We(e, t) {
  try {
    localStorage.setItem(e, t ? "1" : "0");
  } catch {
  }
}
function Tt(e, t) {
  const n = e[t], s = e[(t + 1) % e.length];
  return Math.hypot(s[0] - n[0], s[1] - n[1]);
}
function Et(e) {
  return (e / 100).toFixed(2).replace(".", ",");
}
function de(e) {
  return `var(--rz-${e})`;
}
function Pt(e) {
  return e.map((t) => `${t[0].toFixed(1)},${t[1].toFixed(1)}`).join(" ");
}
function us(e) {
  for (const t of [10, 20, 50, 100, 200, 500, 1e3, 2e3]) if (t >= e) return t;
  return 5e3;
}
let x = class extends me {
  constructor() {
    super(...arguments), this.narrow = !1, this.raumId = "", this.zones = [], this.sensor = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 }, this.umriss = [], this.oeffnungen = [], this.selVertex = -1, this.selOpening = -1, this.openingDraft = null, this.selected = -1, this.sensorOpen = !1, this.tab = "zonen", this.tool = "auswahl", this.draft = [], this.rectDraft = null, this.hover = null, this.view = { cx: 0, cy: 250, scale: 0.8 }, this.size = { w: 800, h: 600 }, this.heatMin = 0, this.auswStunden = 8, this.auswLaedt = !1, this.auswFehler = "", this.wiz = null, this.plan = null, this.planLaedt = !1, this.planAuswahl = null, this.planBilder = {}, this.planEdit = "", this.planAenderung = {}, this.planMessen = null, this.zeigePlan = De("raumzonen-zeige-plan", !0), this.masse = De("raumzonen-masse", !1), this.stockwerk = "", this.wieImHaus = De("raumzonen-wie-im-haus", !0), this.hausExtra = {}, this.neuRaum = null, this.profilStunden = 0, this.profilLaedt = !1, this.auswFigur = "", this.layersOpen = !1, this.layers = { figuren: !0, spuren: !0, ziele: !1, abdeckung: !0 }, this.dirty = !1, this.zonesFollow = !0, this.saving = !1, this.error = "", this.toast = "", this.page = "raum", this.lagen = {}, this.tueren = {}, this.tuerNamen = {}, this.hausLive = {}, this.hausSel = "", this.aufnahme = !0, this.melder = [], this.nurBereich = !0, this.nachlauf = 0, this.melderLagen = {}, this.zoneFuerMelder = "", this.aufnahmeTage = 30, this.history = new An(), this.drag = null, this.liveRoom = "", this.viewTouched = !1, this.sensorAnchor = null, this.hausUnsubs = [], this.fit = () => {
      const e = this.sensor, t = [[e.x, e.y]];
      if (this.page === "haus" && this.data) {
        t.length = 0;
        for (const f of this.hausRaeume()) {
          const b = this.lagen[f.id];
          b && t.push(...this.outlineOf(f).map(($) => Z($, b)));
        }
      }
      for (const f of this.zones) t.push(...j(f.form));
      t.push(...this.umriss), t.length < 4 && this.page === "raum" && t.push(...Ie([e.x, e.y], e.winkel, Math.min(e.reichweite_cm, 500), e.oeffnung_grad, 8));
      const n = this.ansichtWinkel, s = t.map((f) => P(f, n)), i = s.map((f) => f[0]), r = s.map((f) => f[1]), [a, o, h, l] = [Math.min(...i), Math.max(...i), Math.min(...r), Math.max(...r)], c = Math.max(200, o - a), d = Math.max(200, l - h), g = Math.min(this.size.w / (c * 1.2), this.size.h / (d * 1.2)), p = P([(a + o) / 2, (h + l) / 2], -n);
      this.view = { cx: p[0], cy: p[1], scale: Math.max(0.05, Math.min(5, g)) };
    }, this.undo = () => {
      const e = this.history.undo();
      e && (this.zones = e.zones, this.sensor = e.sensor, this.umriss = e.umriss, this.oeffnungen = e.oeffnungen ?? [], this.selVertex = -1, this.selOpening = -1, this.selected >= this.zones.length && (this.selected = -1), this.dirty = !0);
    }, this.finishDraft = () => {
      if (this.draft.length >= 3)
        if (this.tool === "umriss")
          this.remember(), this.umriss = this.draft, this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
        else {
          const e = { art: "vieleck", punkte: this.draft }, t = je(e);
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
        const e = await this._hass.callWS({ type: `${R}/rooms/get` });
        this.data = e, this.ladePlanBilder(), this.error = "";
        const t = e.raeume.some((n) => n.id === this.raumId);
        this.page === "haus" && e.raeume.length ? (this.raumId = t ? this.raumId : e.raeume[0].id, this.openHaus(!0)) : this.selectRoom(t ? this.raumId : e.raeume[0]?.id ?? "", !0);
      } catch (e) {
        this.error = `Laden fehlgeschlagen: ${E(e)}`;
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
      this.sensor = { x: i.x, y: i.y, winkel: i.winkel, reichweite_cm: i.reichweite_cm, oeffnung_grad: i.oeffnung_grad }, this.aufnahme = s.aufnahme ?? !0, this.aufnahmeTage = s.aufnahme_tage ?? 30, this.melder = [...s.melder ?? []], this.melderLagen = structuredClone(s.melder_lagen ?? {}), this.nachlauf = s.melder_nachlauf_s ?? 0, n && (window.clearInterval(this.wizTimer), this.wizLaden()), s.art === "melder" && (this.kandidaten || this.loadKandidaten());
    }
    this.selected = -1, this.sensorOpen = !1, this.draft = [], this.tool = "auswahl", this.dirty = !1, this.history.clear(), n && (this.viewTouched = !1, this.fit()), this.subscribeLive(), this.loadHeat(), n && (this.ausw = void 0, this.auswFigur = "", this.tab === "auswertung" && this.loadAuswertung());
  }
  async subscribeLive() {
    if (!(!this._hass || this.liveRoom === this.raumId) && (await this.unsubscribeLive(), !!this.raumId)) {
      this.liveRoom = this.raumId;
      try {
        this.unsubLive = await this._hass.connection.subscribeMessage((e) => {
          e.raum_id === this.raumId && (this.live = e);
        }, { type: `${R}/live/subscribe`, raum_id: this.raumId });
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
      const n = await this._hass.callWS({ type: `${R}/auswertung/get`, raum_id: e, stunden: t });
      if (e !== this.raumId || t !== this.auswStunden) return;
      this.ausw = n, this.auswFehler = "", this.auswFigur && !n.figuren.some((s) => s.figur === this.auswFigur) && (this.auswFigur = "");
    } catch (n) {
      if (e !== this.raumId) return;
      const s = n;
      this.ausw = void 0, this.auswFehler = s.code === "off" ? "off" : `Auswertung fehlgeschlagen: ${E(n)}`;
    } finally {
      this.auswLaedt = !1;
    }
  }
  async loadHeat() {
    if (window.clearInterval(this.heatTimer), this.heat = void 0, !this._hass || !this.heatMin || !this.raumId) return;
    const e = async () => {
      try {
        this.heat = await this._hass.callWS({ type: `${R}/heat/get`, raum_id: this.raumId, minuten: this.heatMin });
      } catch {
        this.heat = void 0;
      }
    };
    await e(), this.heatTimer = window.setInterval(e, 3e4);
  }
  async save() {
    if (!this._hass || !this.raum || !this.kannAendern) return;
    const e = this.istMelder, t = e ? this.zones.find((s) => !(s.melder ?? []).some((i) => this.melder.includes(i))) : void 0, n = e ? this.melder.length ? t ? `Zone „${t.name}“: bitte den Melder wählen, der sie meldet.` : bt(this.zones) : "Mindestens einen Melder wählen." : bt(this.zones);
    if (n) {
      this.showToast(n);
      return;
    }
    this.saving = !0, this.error = "";
    try {
      await this._hass.callWS({
        type: `${R}/room/save`,
        raum_id: this.raumId,
        zonen: e ? this.zones.map((s) => ({ ...s, melder: (s.melder ?? []).filter((i) => this.melder.includes(i)) })) : this.zones,
        ...e ? {
          melder: this.melder,
          melder_nachlauf_s: this.nachlauf,
          melder_lagen: Object.fromEntries(Object.entries(this.melderLagen).filter(([s]) => this.melder.includes(s)))
        } : { sensor: this.sensor },
        umriss: this.umriss,
        oeffnungen: In(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage
      }), this.dirty = !1, this.showToast("Gespeichert."), await this.unsubscribeLive(), await new Promise((s) => window.setTimeout(s, 1500)), await this.load();
    } catch (s) {
      this.showToast(`Nicht gespeichert: ${E(s)}`);
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
          type: `${R}/converter_zones/get`,
          raum_id: this.raumId
        });
        if (!e.zonen.length) {
          this.showToast("Im Konverter sind keine Software-Zonen eingerichtet.");
          return;
        }
        this.remember();
        const t = this.zones.slice();
        for (const n of e.zonen) t.push(En(n, t, this.data.vorlagen));
        this.zones = t, this.dirty = !0, this.showToast(`${e.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
      } catch (e) {
        this.showToast(`Konverter-Zonen nicht lesbar: ${E(e)}`);
      }
  }
  // -- Hausplan -------------------------------------------------------------
  outlineOf(e) {
    return e.art === "melder" && e.umriss.length < 3 ? [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300]
    ] : Mn(
      e.umriss,
      e.zonen.map((t) => t.form),
      [e.sensor.x, e.sensor.y]
    );
  }
  openHaus(e = !1) {
    if (!this.data || !e && this.page === "haus" || !e && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const t = this.data.raeume;
    this.lagen = Sn(
      t.map((i) => ({
        id: i.id,
        outline: this.outlineOf(i),
        lage: i.haus_gesetzt ? { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel } : null
      }))
    );
    const n = {};
    for (const i of t) for (const r of N(i)) n[r.key] = r.gegenstueck ? `tuer:${r.gegenstueck}` : r.ziel;
    this.tueren = n, this.tuerNamen = {};
    const s = this.page === "haus";
    this.page = "haus", this.hausSel = "", this.hausExtra = {}, this.planAenderung = {}, this.planEdit = "", this.tool = "auswahl", this.dirty = !1, this.unsubscribeLive(), this.subscribeHaus(), s || (this.viewTouched = !1, this.fit());
  }
  async subscribeHaus() {
    if (await this.unsubscribeHaus(), !(!this._hass || !this.data))
      for (const e of this.data.raeume)
        try {
          const t = await this._hass.connection.subscribeMessage((n) => {
            this.hausLive = { ...this.hausLive, [n.raum_id]: n };
          }, { type: `${R}/live/subscribe`, raum_id: e.id });
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
  // -- Assistent: Sensor umsetzen oder einmessen ----------------------------
  wizKey() {
    return `raumzonen-assistent-${this.raumId}`;
  }
  /** Stellen „vorher“ überleben das Neuladen der Seite (das Umhängen dauert). */
  wizSpeichern() {
    try {
      this.wiz && this.wiz.modus === "umsetzen" && this.wiz.schritt !== "ergebnis" ? localStorage.setItem(this.wizKey(), JSON.stringify({ ...this.wiz, messung: void 0 })) : localStorage.removeItem(this.wizKey());
    } catch {
    }
  }
  wizLaden() {
    try {
      const e = localStorage.getItem(this.wizKey());
      this.wiz = e ? JSON.parse(e) : null;
    } catch {
      this.wiz = null;
    }
  }
  wizStart(e) {
    window.clearInterval(this.wizTimer), this.wiz = { modus: e, schritt: e === "umsetzen" ? "vorher" : "nachher", raum: [null, null, null], sensor: [null, null, null], aktiv: 0 }, this.wizSpeichern();
  }
  wizEnde() {
    window.clearInterval(this.wizTimer), this.wiz = null, this.wizSpeichern();
  }
  /** Genau eine Person sichtbar? Dann ihre Lage im Raum (wie gemeldet). */
  wizPerson() {
    const e = this.live;
    if (!e || !e.verfuegbar || e.problem) return { punkt: null, hinweis: "Sensor nicht erreichbar." };
    const t = e.figuren.filter((n) => !n.gehalten && !n.tags.some((s) => ["wiederhergestellt", "stoerung", "hund", "echo"].includes(s)));
    return t.length === 0 ? { punkt: null, hinweis: "Der Sensor sieht gerade niemanden." } : t.length > 1 ? { punkt: null, hinweis: "Der Sensor sieht mehr als eine Person. Bitte allein im Raum sein." } : { punkt: [t[0].x, t[0].y], hinweis: "" };
  }
  wizMessen() {
    const e = this.wiz;
    e && (window.clearInterval(this.wizTimer), this.wiz = { ...e, fehler: void 0, messung: { bis: Date.now() + os * 1e3, punkte: [], hinweis: "" } }, this.wizTimer = window.setInterval(() => {
      const t = this.wiz;
      if (!t?.messung) return;
      const { punkt: n, hinweis: s } = this.wizPerson(), i = n ? [...t.messung.punkte, n] : t.messung.punkte;
      if (Date.now() < t.messung.bis) {
        this.wiz = { ...t, messung: { ...t.messung, punkte: i, hinweis: s } };
        return;
      }
      window.clearInterval(this.wizTimer);
      const r = Xn(i);
      if (!r || i.length < 8) {
        this.wiz = { ...t, messung: void 0, fehler: s || "Zu wenig gesehen. Noch einmal versuchen." };
        return;
      }
      if (r.streuung_cm > ls) {
        this.wiz = { ...t, messung: void 0, fehler: `Zu unruhig (Punkte streuen ${Math.round(r.streuung_cm)} cm). Bitte ruhig stehen und noch einmal.` };
        return;
      }
      this.wizGemessen(r.punkt);
    }, 250));
  }
  /** Eine Stelle ist gemessen (Raumkoordinaten mit der gespeicherten Lage). */
  wizGemessen(e) {
    const t = this.wiz, n = this.raum?.sensor;
    if (!t || !n) return;
    const s = t.aktiv;
    if (t.schritt === "vorher") {
      const i = t.raum.map((o, h) => h === s ? e : o), r = i.every(Boolean), a = r ? Mt(i) : "";
      this.wiz = { ...t, raum: i, messung: void 0, aktiv: r ? 0 : s + 1, schritt: r && !a ? "umhaengen" : "vorher", fehler: a || void 0 }, a && (this.wiz = { ...this.wiz, raum: [null, null, null], aktiv: 0 });
    } else {
      const i = t.sensor.map((r, a) => a === s ? Ft(e, n) : r);
      this.wiz = { ...t, sensor: i, messung: void 0, tippen: t.modus === "einmessen" }, t.modus === "umsetzen" && this.wizWeiter();
    }
    this.wizSpeichern();
  }
  /** Einmessen: die Stelle im Plan angetippt. */
  wizAngetippt(e) {
    const t = this.wiz;
    if (!t) return;
    const n = t.raum.map((s, i) => i === t.aktiv ? e : s);
    this.wiz = { ...t, raum: n, tippen: !1 }, this.wizWeiter();
  }
  wizWeiter() {
    const e = this.wiz;
    if (!e) return;
    const t = e.aktiv;
    if (t < 2) {
      this.wiz = { ...e, aktiv: t + 1 };
      return;
    }
    const n = e.raum, s = Mt(n), i = qn(e.sensor, n);
    if (!i || s) {
      this.wiz = { ...e, schritt: "nachher", aktiv: 0, sensor: [null, null, null], raum: e.modus === "einmessen" ? [null, null, null] : e.raum, fehler: s || "Konnte nicht rechnen. Noch einmal." };
      return;
    }
    this.wiz = { ...e, schritt: "ergebnis", ergebnis: i }, this.wizSpeichern();
  }
  /** Neue Lage übernehmen. Zonen bleiben, wo sie im Raum sind. */
  wizUebernehmen() {
    const e = this.wiz?.ergebnis;
    e && (this.remember(), this.sensor = { ...this.sensor, x: e.x, y: e.y, winkel: e.winkel }, this.dirty = !0, this.wizEnde(), this.showToast("Neue Lage eingetragen. Zum Behalten oben „Speichern“ tippen."));
  }
  // -- Grundriss übernehmen -------------------------------------------------
  async planLaden(e) {
    this.planLaedt = !0;
    const t = e.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Grundriss";
    try {
      if (e.type === "application/pdf" || e.name.toLowerCase().endsWith(".pdf")) {
        const n = [];
        for (const s of Jn(new Uint8Array(await e.arrayBuffer()))) {
          const i = new Blob([s.slice()], { type: "image/jpeg" });
          await this.istGrundriss(i) && n.push(i);
        }
        if (!n.length) throw new Error("Im PDF ist kein Bild des Grundrisses.");
        if (n.length > 1) {
          this.planAuswahl = { name: t, bilder: n.map((s) => ({ blob: s, url: URL.createObjectURL(s) })) };
          return;
        }
        await this.planBildLaden(n[0], t);
        return;
      }
      await this.planBildLaden(e, t);
    } catch (n) {
      this.showToast(`Grundriss nicht gelesen: ${E(n)}`);
    } finally {
      this.planLaedt = !1;
    }
  }
  /** Grob prüfen, ob ein Bild etwas zeigt (leere Seiten und kleine Symbole weglassen). */
  async istGrundriss(e) {
    try {
      const t = await createImageBitmap(e);
      if (t.width < 300 || t.height < 200) return !1;
      const n = document.createElement("canvas");
      n.width = 200, n.height = 200;
      const s = n.getContext("2d");
      s.drawImage(t, 0, 0, 200, 200);
      const i = s.getImageData(0, 0, 200, 200).data;
      let r = 0;
      for (let a = 0; a < i.length; a += 4) i[a] + i[a + 1] + i[a + 2] < 600 && r++;
      return r > 200;
    } catch {
      return !1;
    }
  }
  planAuswahlZu() {
    for (const e of this.planAuswahl?.bilder ?? []) URL.revokeObjectURL(e.url);
    this.planAuswahl = null;
  }
  async planAuswaehlen(e) {
    const t = this.planAuswahl;
    if (!t) return;
    const n = t.bilder[e].blob, s = `${t.name} ${e + 1}`.slice(0, 60);
    this.planAuswahlZu(), this.planLaedt = !0;
    try {
      await this.planBildLaden(n, s);
    } catch (i) {
      this.showToast(`Grundriss nicht gelesen: ${E(i)}`);
    } finally {
      this.planLaedt = !1;
    }
  }
  async planBildLaden(e, t) {
    {
      const n = await createImageBitmap(e), s = Math.min(1, 4e3 / Math.max(n.width, n.height)), i = document.createElement("canvas");
      i.width = Math.round(n.width * s), i.height = Math.round(n.height * s);
      const r = i.getContext("2d");
      r.drawImage(n, 0, 0, i.width, i.height);
      const a = r.getImageData(0, 0, i.width, i.height), o = ss({ width: a.width, height: a.height, data: a.data }), h = {};
      o.luecken.forEach((c, d) => h[d] = c.partner !== null ? "tuer" : "fenster");
      const l = i.toDataURL("image/jpeg", 0.85).split(",")[1];
      this.plan = { bild: URL.createObjectURL(e), g: o, zuordnung: o.raeume.map(() => ""), art: h, massRaum: 0, massSeite: "breite", massM: 0, jpeg: l, name: t, strecke: [], streckeM: 0 };
    }
  }
  planZu() {
    this.plan && URL.revokeObjectURL(this.plan.bild), this.plan = null;
  }
  /** Zentimeter je Bildpunkt aus dem eingegebenen Maß (0 = noch keins). */
  planCmProPx() {
    const e = this.plan;
    if (e && e.strecke.length === 2 && e.streckeM > 0) {
      const s = Math.hypot(e.strecke[1][0] - e.strecke[0][0], e.strecke[1][1] - e.strecke[0][1]);
      return s > 0 ? e.streckeM * 100 / s : 0;
    }
    if (!e || !(e.massM > 0) || !e.g.raeume[e.massRaum]) return 0;
    const t = se(e.g.raeume[e.massRaum].punkte), n = e.massSeite === "breite" ? t.x1 - t.x0 : t.y1 - t.y0;
    return n > 0 ? e.massM * 100 / n : 0;
  }
  async planUebernehmen() {
    const e = this.plan, t = this.planCmProPx();
    if (!e || !t || !this._hass || !this.data) return;
    const n = this.data.raeume, s = e.g.raeume.map((h, l) => l).filter((h) => e.zuordnung[h]).map((h) => {
      const l = n.find((p) => p.id === e.zuordnung[h]), c = l.umriss.length >= 3 ? l.umriss : l.zonen.length ? [...l.zonen.flatMap((p) => j(p.form)), [l.sensor.x, l.sensor.y]] : [], d = St(e.g, h, t);
      let g = [0, 0];
      if (c.length) {
        const p = se(c), f = se(d.umriss);
        g = [Math.round((p.x0 + p.x1 - f.x0 - f.x1) / 2), Math.round((p.y0 + p.y1 - f.y0 - f.y1) / 2)];
      }
      return { i: h, raum: l, u: St(e.g, h, t, g) };
    }), i = n.filter((h) => h.haus_gesetzt && this.aufStockwerk(h) && !s.some((l) => l.raum.id === h.id)), r = (h) => se(h);
    let a = 0;
    if (i.length) {
      const h = r(i.flatMap((d) => this.outlineOf(d).map((g) => Z(g, { x: d.haus_x, y: d.haus_y, winkel: d.haus_winkel })))), l = s.length ? r(s.flatMap((d) => d.u.umriss.map((g) => Z(g, d.u.haus)))) : { x0: 0, y0: 0, x1: e.g.breite * t, y1: e.g.hoehe * t };
      l.x0 < h.x1 && l.x1 > h.x0 && l.y0 < h.y1 && l.y1 > h.y0 && (a = h.x1 + 200 - l.x0);
    }
    const o = s.map(({ i: h, raum: l, u: c }) => ({
      raum_id: l.id,
      ...this.stockwerk && !(l.stockwerke ?? []).length ? { stockwerke: [this.stockwerk] } : {},
      umriss: c.umriss,
      haus: { x: c.haus.x + a, y: c.haus.y, winkel: 0 },
      oeffnungen: c.luecken.filter((d) => e.art[d.luecke] !== "fenster").map((d) => {
        const g = e.g.luecken[d.luecke].partner, p = g !== null ? e.zuordnung[g] || "" : "aussen";
        return { kante: d.kante, von: d.von, bis: d.bis, art: e.art[d.luecke] === "offen" ? "offen" : "tuer", fuehrt_zu: p === l.id ? "" : p };
      })
    }));
    this.saving = !0;
    try {
      await this._hass.callWS({
        type: `${R}/plan/import`,
        raeume: o,
        plan: { name: e.name, mime: "image/jpeg", bild: e.jpeg, cm_pro_px: t, breite_px: e.g.breite, hoehe_px: e.g.hoehe, x: a, y: 0, stockwerk: this.stockwerk }
      }), this.planZu(), this.showToast(o.length ? `${o.length} ${o.length === 1 ? "Raum" : "Räume"} und der Grundriss übernommen.` : "Grundriss als Hintergrund übernommen."), await this.unsubscribeHaus(), await new Promise((h) => window.setTimeout(h, 1500)), await this.load(), this.viewTouched = !1, this.fit();
    } catch (h) {
      this.showToast(`Nicht übernommen: ${E(h)}`);
    } finally {
      this.saving = !1;
    }
  }
  async loadKandidaten() {
    if (!(!this._hass || !this.kannAendern))
      try {
        this.kandidaten = await this._hass.callWS({ type: `${R}/kandidaten/get` });
      } catch (e) {
        this.showToast(`Geräte nicht geladen: ${E(e)}`);
      }
  }
  /** Melder für die Auswahl: nur aus dem Bereich (wenn gewünscht); gewählte immer. */
  melderAuswahl(e, t, n) {
    const s = (i) => n.includes(i.id) || n.includes(i.entity_id);
    return e.filter((i) => s(i) || i.angeboten !== !1 && (!this.nurBereich || !t || i.bereich_id === t));
  }
  /** Zweite Zeile eines Melders: Art, Gerät, Bereich. */
  melderInfo(e) {
    return e.angeboten === !1 ? "Zone eines Radarsensors (FP400): besser abwählen und den Raum als Radar-Raum anlegen" : [e.typ ?? (e.klasse === "motion" ? "Bewegungsmelder" : "Anwesenheit"), e.modell, this.bereichName(e.bereich_id)].filter(Boolean).join(" · ");
  }
  renderNurBereich(e) {
    return e ? u`<label class="check"
      ><input type="checkbox" .checked=${this.nurBereich} @change=${(t) => this.nurBereich = t.target.checked} /><span
        >Nur Melder aus „${this.bereichName(e)}“</span
      ></label
    >` : m;
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
        const t = { type: `${R}/room/create`, name: e.name.trim(), art: e.art };
        e.bereich_id && (t.bereich_id = e.bereich_id), e.art === "melder" ? t.melder = e.melder ?? [] : t.device_id = e.device_id, await this._hass.callWS(t), this.neuRaum = null, this.showToast(`Raum „${e.name.trim()}“ angelegt. Jetzt im Plan an seinen Platz ziehen.`), await this.unsubscribeHaus(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load(), this.viewTouched = !1, this.fit(), await this.loadKandidaten();
      } catch (t) {
        this.showToast(`Nicht angelegt: ${E(t)}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  async loadWege() {
    if (!(!this._hass || !this.kannAendern))
      try {
        this.wege = await this._hass.callWS({ type: `${R}/wege/get` });
      } catch (e) {
        this.showToast(`Wege nicht geladen: ${E(e)}`);
      }
  }
  /** Die letzten Wege durchs Haus: wer ging wann durch welche Tür wohin. */
  renderWege() {
    const e = this.wege, t = (s) => this.data?.raeume.find((i) => i.id === s)?.name ?? s, n = (s) => new Date(s * 1e3).toLocaleTimeString(this._hass?.language ?? "de", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return u`<h3>Wege</h3>
      <p class="hint small">
        Wer ging wann von welchem Raum in welchen? Dafür braucht jede Tür eine Tür-Zone (im Raum unter „Zonen“: „Tür-Zonen anlegen“) und eine Verbindung zur Tür gegenüber.
        Zwischen zwei Radar-Räumen genau, mit Bewegungsmeldern grob.
      </p>
      <div class="actions">
        <button class="text small" @click=${() => void this.loadWege()}><ha-icon icon="mdi:refresh"></ha-icon>${e ? "Neu laden" : "Anzeigen"}</button>
      </div>
      ${e ? e.wege.length ? u`<ul class="list wege">
              ${[...e.wege].reverse().slice(0, 20).map(
      (s) => u`<li class="item">
                    <div class="row static">
                      <span class="marker-icon"><ha-icon icon="mdi:walk"></ha-icon></span>
                      <span class="name"
                        >${t(s.von)} → ${t(s.nach)}<small>${n(s.zeit)}${s.tuer ? ` · ${s.tuer}` : ""}${s.genau ? "" : " · grob (Melder)"}</small></span
                      >
                    </div>
                  </li>`
    )}
            </ul>` : u`<p class="hint small">${e.tueren ? "Noch kein Weg erkannt (seit dem letzten Neustart)." : "Noch keine Tür-Zone in einem Radar-Raum."}</p>` : m}`;
  }
  /** Melder-Raum mit Anzeigen eines FP400 → Radar-Raum (Wände, Türen, Lage bleiben). */
  async umwandeln(e, t) {
    const n = this.raum;
    if (!(!this._hass || !n || !this.kannAendern)) {
      if (this.dirty) {
        this.showToast("Erst speichern oder verwerfen.");
        return;
      }
      if (confirm(
        `„${n.name}“ als Radar-Raum mit „${t}“ einrichten? Wände, Türen, Lage im Haus und „Anwesenheit“ bleiben; die Melder-Zuordnung entfällt. Danach die Zonen aus der Zonen-Karte übernehmen und den Sensor an seinen Platz ziehen.`
      )) {
        this.saving = !0;
        try {
          await this._hass.callWS({ type: `${R}/room/umwandeln`, raum_id: n.id, device_id: e }), this.showToast("Jetzt Radar-Raum. Unter „Zonen“: „Aus dem Konverter übernehmen“; den Sensor an seinen Platz ziehen."), await this.unsubscribeLive(), await new Promise((s) => window.setTimeout(s, 1500)), await this.load(), this.selectRoom(n.id, !0), this.openTab("zonen"), await this.loadKandidaten();
        } catch (s) {
          this.showToast(`Nicht umgewandelt: ${E(s)}`);
        } finally {
          this.saving = !1;
        }
      }
    }
  }
  /** Radarsensor, dessen Anzeigen dieser Melder-Raum nutzt (oder der im selben Bereich hängt). */
  radarFuerRaum() {
    const e = this.kandidaten, t = this.raum;
    if (!e || !t || !this.istMelder) return null;
    const n = e.fp400.filter((i) => !i.benutzt);
    for (const i of e.melder) {
      if (i.angeboten !== !1 || !i.device_id || !this.melder.includes(i.id) && !this.melder.includes(i.entity_id)) continue;
      const r = n.find((a) => a.device_id === i.device_id);
      if (r) return { device_id: r.device_id, name: r.name };
    }
    const s = t.bereich_id ? n.find((i) => i.bereich_id === t.bereich_id) : void 0;
    return s ? { device_id: s.device_id, name: s.name } : null;
  }
  async deleteRoom() {
    const e = this.raum;
    if (!(!this._hass || !e || !this.kannAendern) && confirm(`Raum „${e.name}“ mit allen Zonen und seinen Anzeigen in Home Assistant löschen? Automationen, die sie benutzen, gehen dann nicht mehr.`)) {
      this.saving = !0;
      try {
        await this._hass.callWS({ type: `${R}/room/delete`, raum_id: e.id }), this.dirty = !1, this.showToast(`Raum „${e.name}“ gelöscht.`), await this.unsubscribeLive(), await new Promise((t) => window.setTimeout(t, 1500)), this.page = "haus", await this.load();
      } catch (t) {
        this.showToast(`Nicht gelöscht: ${E(t)}`);
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
          const r = await this._hass.callWS({ type: `${R}/auswertung/get`, raum_id: i.id, stunden: e });
          t[i.id] = Cn(r.figuren.filter((a) => !a.hund).map((a) => a.abschnitte)), n = r.von, s = r.bis;
        } catch {
        }
      })
    ), e === this.profilStunden && (this.profil = n ? { von: n, bis: s, raeume: t } : void 0, this.profilLaedt = !1);
  }
  async saveHaus() {
    if (!(!this._hass || !this.data || !this.kannAendern)) {
      this.saving = !0;
      try {
        const e = new Map(this.data.raeume.flatMap((i) => N(i)).map((i) => [i.key, i])), t = (i) => i.gegenstueck ? `tuer:${i.gegenstueck}` : i.ziel, s = [.../* @__PURE__ */ new Set([...Object.keys(this.tueren), ...Object.keys(this.tuerNamen)])].filter((i) => e.has(i)).filter((i) => (this.tueren[i] ?? t(e.get(i))) !== t(e.get(i)) || i in this.tuerNamen).map((i) => {
          const r = e.get(i), a = this.tueren[i] ?? t(r), o = a.startsWith("tuer:") ? a.slice(5) : "", l = { fuehrt_zu: (o ? o.split("/")[0] : a) || null, gegenstueck: o || null };
          return r.oeffnung !== void 0 ? { raum_id: r.raumId, oeffnung: r.oeffnung, ...l, ...i in this.tuerNamen ? { name: this.tuerNamen[i] } : {} } : { raum_id: r.raumId, zone_id: r.zoneId, ...l };
        });
        await this._hass.callWS({
          type: `${R}/haus/save`,
          raeume: Object.entries(this.lagen).map(([i, r]) => ({ raum_id: i, x: Math.round(r.x), y: Math.round(r.y), winkel: r.winkel, ...this.hausExtra[i] ?? {} })),
          plaene: Object.entries(this.planAenderung).map(([i, r]) => ({ plan_id: i, x: Math.round(r.x), y: Math.round(r.y), winkel: r.winkel, zuschnitt: r.zuschnitt, cm_pro_px: r.cm_pro_px, stockwerk: r.stockwerk || null })),
          tueren: s
        }), this.dirty = !1, this.hausExtra = {}, this.planAenderung = {}, this.tuerNamen = {}, this.planEdit = "", this.showToast("Hausplan gespeichert."), await this.unsubscribeHaus(), await new Promise((i) => window.setTimeout(i, 1500)), await this.load();
      } catch (e) {
        this.showToast(`Nicht gespeichert: ${E(e)}`);
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
    super.disconnectedCallback(), window.removeEventListener("keydown", this.onKey), window.clearInterval(this.heatTimer), window.clearInterval(this.auswTimer), window.clearInterval(this.wizTimer), this.resize?.disconnect(), this.resize = void 0, this.unsubscribeLive(), this.unsubscribeHaus();
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
  /**
   * Drehung der Ansicht (Grad, nur Anzeige): im Raum „wie im Hausplan“, damit
   * Raum und Grundriss so liegen wie im Haus. Die Daten bleiben unverändert.
   */
  get ansichtWinkel() {
    return this.page !== "raum" || !this.raum?.haus_gesetzt || !this.wieImHaus ? 0 : this.raum.haus_winkel ?? 0;
  }
  toScreen([e, t]) {
    const { cx: n, cy: s, scale: i } = this.view, [r, a] = P([e - n, t - s], this.ansichtWinkel);
    return [this.size.w / 2 + r * i, this.size.h / 2 - a * i];
  }
  screenPoints(e) {
    return Pt(e.map((t) => this.toScreen(t)));
  }
  toWorld(e) {
    const n = this.renderRoot.querySelector("svg.plan")?.getBoundingClientRect() ?? { left: 0, top: 0 }, { cx: s, cy: i, scale: r } = this.view, [a, o] = P([(e.clientX - n.left - this.size.w / 2) / r, -(e.clientY - n.top - this.size.h / 2) / r], -this.ansichtWinkel);
    return [s + a, i + o];
  }
  snapped(e) {
    return kn(e, as);
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
    n[e] = $t(n[e], t, this.data.vorlagen), this.zones = n, this.dirty = !0;
  }
  addZone(e) {
    if (!this.data) return;
    this.remember();
    const t = pt(e, this.zones, this.data.vorlagen);
    if (this.istMelder) {
      const n = this.zoneFuerMelder || (this.melder.length === 1 ? this.melder[0] : "");
      t.melder = n ? [n] : [], t.regel = { ...t.regel, frei_nach_s: 0 }, n && (t.name = this.melderName(n)), this.zoneFuerMelder = "";
    }
    this.zones = [...this.zones, t], this.select(this.zones.length - 1), this.dirty = !0;
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
    const [e, t] = _e(this.sensor.winkel), n = 46 / this.view.scale;
    return [this.sensor.x + e * n, this.sensor.y + t * n];
  }
  near(e, t, n = H) {
    return Fe(this.toScreen(e), this.toScreen(t)) <= n;
  }
  zoneAt(e) {
    for (let t = this.zones.length - 1; t >= 0; t--) if (He(e, this.zones[t].form)) return t;
    return -1;
  }
  onPointerDown(e) {
    if (e.button === 2) return;
    this.layersOpen = !1;
    const t = e.currentTarget, n = this.toWorld(e), s = this.snapped(n);
    if (t.setPointerCapture(e.pointerId), this.wiz?.tippen && this.page === "raum") {
      this.wizAngetippt(s);
      return;
    }
    if (this.page === "haus" && this.planEdit && this.planMessen && this.planMessen.punkte.length < 2) {
      this.planMessen = { ...this.planMessen, punkte: [...this.planMessen.punkte, n] };
      return;
    }
    if (this.page === "haus" && this.planEdit) {
      const l = this.data?.plaene?.find((c) => c.id === this.planEdit);
      if (l && this.kannAendern) {
        const [c, d, g, p] = this.planZuschnitt(l), b = [
          [c, d],
          [g, d],
          [g, p],
          [c, p]
        ].findIndex(([_, w]) => this.near(n, this.planZuHaus(l, _, w), H + 4));
        if (b >= 0) {
          this.drag = { kind: "plan-crop", id: l.id, ecke: b };
          return;
        }
        const [$, k] = this.hausZuPlan(l, n);
        if ($ >= c && $ <= g && k >= d && k <= p) {
          this.drag = { kind: "plan-move", id: l.id, last: n };
          return;
        }
      }
    }
    if (this.page === "haus") {
      const l = this.hausRoomAt(n);
      this.hausSel = l, l && this.kannAendern ? this.drag = { kind: "haus-raum", id: l, last: n } : this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }
    if (!this.kannAendern) {
      const l = this.zoneAt(n);
      this.select(l), l < 0 && (this.sensorOpen = !1, this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } });
      return;
    }
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft.length >= 3 && this.near(n, this.draft[0]) ? this.finishDraft() : this.draft = [...this.draft, s];
      return;
    }
    if (this.tool === "oeffnung") {
      const l = this.wallAt(n, H * 2);
      if (l < 0) {
        this.showToast(this.umriss.length >= 3 ? "Bitte direkt auf einer Wand beginnen." : "Zuerst die Wände zeichnen.");
        return;
      }
      this.drag = { kind: "opening", kante: l, start: n }, this.openingDraft = null;
      return;
    }
    if (this.tool === "rechteck") {
      this.drag = { kind: "rect", start: s }, this.rectDraft = [s, s];
      return;
    }
    if (this.tool === "zellen") {
      let l = this.selected;
      l < 0 || this.zones[l].form.art !== "zellen" ? (this.addZone({ art: "zellen", groesse: $n, zellen: [] }), l = this.zones.length - 1) : this.remember();
      const c = this.zones[l].form, [d, g] = Qe(n, c.groesse, c.x0 ?? 0, c.y0 ?? 0), p = !c.zellen.some(([f, b]) => f === d && b === g);
      this.drag = { kind: "paint", add: p }, this.updateZone(l, { form: ft(c, n, p) });
      return;
    }
    if (this.istMelder) {
      for (const [l, c] of Object.entries(this.melderLagen))
        if (this.melder.includes(l)) {
          if (this.near(n, this.melderGriff(c), H + 2)) {
            this.remember(), this.drag = { kind: "melder-rotate", key: l };
            return;
          }
          if (this.near(n, [c.x, c.y], H + 4)) {
            this.remember(), this.drag = { kind: "melder", key: l };
            return;
          }
        }
    }
    const i = this.oeffnungen[this.selOpening];
    if (i && this.umriss.length >= 3) {
      const [l, c] = ce(this.umriss, i);
      for (const [d, g] of [["von", l], ["bis", c]])
        if (this.near(n, g, H + 4)) {
          this.remember(), this.drag = { kind: "opening-end", index: this.selOpening, ende: d };
          return;
        }
    }
    const r = this.openingAt(n);
    if (r >= 0 && r === this.selOpening) {
      const l = this.oeffnungen[r];
      this.remember(), this.drag = { kind: "opening-move", index: r, start: fe(this.umriss, l.kante, n), von: l.von, bis: l.bis };
      return;
    }
    const a = this.zones[this.selected];
    if (a && a.form.art !== "zellen" && this.near(n, this.zoneRotateHandle(a.form))) {
      this.remember();
      const l = T(a.form);
      this.drag = { kind: "rotate-zone", center: l, start: we(l, n), anchor: a.form };
      return;
    }
    if (a?.form.art === "vieleck") {
      const l = a.form.punkte.findIndex((d) => this.near(n, d));
      if (l >= 0) {
        if (this.remember(), e.altKey) {
          this.deleteVertex(this.selected, l);
          return;
        }
        this.selVertex = l, this.drag = { kind: "vertex", index: l };
        return;
      }
      const c = te(a.form.punkte).findIndex((d) => this.near(n, d));
      if (c >= 0) {
        this.remember(), this.updateZone(this.selected, { form: mt(a.form, c, this.snapped(te(a.form.punkte)[c])) }), this.selVertex = c + 1, this.drag = { kind: "vertex", index: c + 1 };
        return;
      }
    } else if (a?.form.art === "rechteck") {
      const l = a.form, c = ze(l.mitte, l.breite, l.tiefe, l.winkel).findIndex((d) => this.near(n, d));
      if (c >= 0) {
        this.remember(), this.drag = { kind: "corner", index: c };
        return;
      }
    }
    if (!this.istMelder && this.near(n, this.sensorHandle(), H + 2)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor-rotate" }, this.openSensor();
      return;
    }
    if (!this.istMelder && this.near(n, [this.sensor.x, this.sensor.y], H + 4)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor" }, this.openSensor();
      return;
    }
    const o = this.zoneAt(n);
    if (o >= 0) {
      this.select(o), this.remember(), this.drag = { kind: "zone", last: s };
      return;
    }
    const h = this.umriss.findIndex((l) => this.near(n, l));
    if (h >= 0) {
      this.remember(), this.drag = { kind: "umriss-vertex", index: h };
      return;
    }
    if (this.umriss.length >= 3) {
      const l = te(this.umriss).findIndex((d) => this.near(n, d));
      if (l >= 0) {
        this.remember();
        const d = this.umriss.slice();
        d.splice(l + 1, 0, this.snapped(te(this.umriss)[l])), this.oeffnungen = wt(this.oeffnungen, { inserted: l }, this.umriss.length), this.umriss = d, this.dirty = !0, this.drag = { kind: "umriss-vertex", index: l + 1 };
        return;
      }
      const c = this.openingAt(n);
      if (c >= 0) {
        this.selected = -1, this.selOpening = c, this.sensorOpen = !1, this.openTab("raum");
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
      this.remember(), this.updateZone(e, { form: Tn(n.form, t) }), this.selVertex = -1;
    }
  }
  deleteWallCorner(e) {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember(), this.oeffnungen = wt(this.oeffnungen, { removed: e }, this.umriss.length), this.umriss = this.umriss.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0;
  }
  changeOpening(e, t) {
    this.remember(), this.oeffnungen = this.oeffnungen.map((n, s) => s === e ? { ...n, ...t } : n), this.dirty = !0;
  }
  deleteOpening(e) {
    confirm("Diese Öffnung in der Wand löschen?") && (this.remember(), this.oeffnungen = this.oeffnungen.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0);
  }
  turnZone(e, t) {
    const n = this.zones[e];
    !n || n.form.art === "zellen" || (this.remember(), this.updateZone(e, { form: xt(n.form, T(n.form), t) }));
  }
  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  wallAt(e, t = H) {
    const n = this.umriss.length;
    if (n < 3) return -1;
    let s = -1, i = t;
    for (let r = 0; r < n; r++) {
      const a = Oe(this.toScreen(e), this.toScreen(this.umriss[r]), this.toScreen(this.umriss[(r + 1) % n]));
      a <= i && (s = r, i = a);
    }
    return s;
  }
  openingAt(e) {
    return this.oeffnungen.findIndex((t) => {
      const [n, s] = ce(this.umriss, t);
      return Oe(this.toScreen(e), this.toScreen(n), this.toScreen(s)) <= H;
    });
  }
  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  zoneRotateHandle(e) {
    const t = T(e), n = Math.max(...j(e).map((s) => s[1]));
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
        const [r, a] = P([(e.clientX - s.start[0]) / this.view.scale, -(e.clientY - s.start[1]) / this.view.scale], -this.ansichtWinkel);
        this.view = { ...this.view, cx: s.view.cx - r, cy: s.view.cy - a };
        break;
      }
      case "vertex":
        i && this.updateZone(this.selected, { form: Rn(i.form, s.index, n) });
        break;
      case "corner":
        i?.form.art === "rechteck" && this.updateZone(this.selected, { form: Pn(i.form, s.index, n) });
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
          const o = i.form.groesse, h = Math.round(r / o), l = Math.round(a / o);
          if (!h && !l) break;
          this.updateZone(this.selected, { form: Ce(i.form, h * o, l * o) }), this.drag = { kind: "zone", last: [s.last[0] + h * o, s.last[1] + l * o] };
        } else (r || a) && (this.updateZone(this.selected, { form: Ce(i.form, r, a) }), this.drag = { kind: "zone", last: n });
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: n[0], y: n[1] });
        break;
      case "sensor-rotate": {
        let r = we([this.sensor.x, this.sensor.y], t);
        e.shiftKey || (r = Math.round(r / 5) * 5), r <= -180 && (r += 360), this.moveSensor({ ...this.sensor, winkel: r });
        break;
      }
      case "paint":
        i?.form.art === "zellen" && this.updateZone(this.selected, { form: ft(i.form, t, s.add) });
        break;
      case "rect":
        this.rectDraft = [s.start, n];
        break;
      case "opening": {
        this.openingDraft = Hn(this.umriss, s.kante, s.start, t);
        break;
      }
      case "plan-move": {
        const r = this.data?.plaene?.find((l) => l.id === s.id);
        if (!r) break;
        const a = Math.round((t[0] - s.last[0]) / 5) * 5, o = Math.round((t[1] - s.last[1]) / 5) * 5;
        if (!a && !o) break;
        const h = this.planLage(r);
        this.planAendern(r, { x: h.x + a, y: h.y + o }), this.drag = { ...s, last: [s.last[0] + a, s.last[1] + o] };
        break;
      }
      case "plan-crop": {
        const r = this.data?.plaene?.find((b) => b.id === s.id);
        if (!r) break;
        const [a, o] = this.hausZuPlan(r, t);
        let [h, l, c, d] = this.planZuschnitt(r);
        const g = Math.max(0, Math.min(r.breite_px, a)), p = Math.max(0, Math.min(r.hoehe_px, o)), f = 20;
        s.ecke === 0 || s.ecke === 3 ? h = Math.min(g, c - f) : c = Math.max(g, h + f), s.ecke === 0 || s.ecke === 1 ? l = Math.min(p, d - f) : d = Math.max(p, l + f), this.planAendern(r, { zuschnitt: [h, l, c, d].map((b) => Math.round(b)) });
        break;
      }
      case "melder": {
        const r = this.melderLagen[s.key];
        r && (this.melderLagen = { ...this.melderLagen, [s.key]: { ...r, x: n[0], y: n[1] } }), this.dirty = !0;
        break;
      }
      case "melder-rotate": {
        const r = this.melderLagen[s.key];
        if (!r) break;
        let a = we([r.x, r.y], t);
        e.shiftKey || (a = Math.round(a / 5) * 5), a <= -180 && (a += 360), this.melderLagen = { ...this.melderLagen, [s.key]: { ...r, winkel: a } }, this.dirty = !0;
        break;
      }
      case "opening-end": {
        const r = this.oeffnungen[s.index];
        if (!r) break;
        const a = Tt(this.umriss, r.kante), o = Math.max(0, Math.min(Math.floor(a), Math.round(fe(this.umriss, r.kante, t) / 5) * 5)), h = s.ende === "von" ? { ...r, von: Math.min(o, r.bis - 20) } : { ...r, bis: Math.max(o, r.von + 20) };
        this.oeffnungen = this.oeffnungen.map((l, c) => c === s.index ? h : l), this.dirty = !0;
        break;
      }
      case "opening-move": {
        const r = this.oeffnungen[s.index];
        if (!r) break;
        const a = Math.floor(Tt(this.umriss, r.kante)), o = s.bis - s.von;
        let h = Math.round((s.von + fe(this.umriss, r.kante, t) - s.start) / 5) * 5;
        h = Math.max(0, Math.min(a - o, h)), h !== r.von && (this.oeffnungen = this.oeffnungen.map((l, c) => c === s.index ? { ...r, von: h, bis: h + o } : l), this.dirty = !0);
        break;
      }
      case "rotate-zone": {
        let r = we(s.center, t) - s.start;
        e.shiftKey || (r = Math.round(r / 5) * 5), this.updateZone(this.selected, { form: xt(s.anchor, s.center, r) });
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
    this.zonesFollow && t && (this.zones = t.zones.map((n) => ({ ...n, form: zn(n.form, t.sensor, e) }))), this.dirty = !0;
  }
  onPointerUp() {
    const e = this.drag;
    if (this.drag = null, this.sensorAnchor = null, e?.kind === "opening") {
      const t = this.openingDraft;
      if (this.openingDraft = null, t) {
        this.remember();
        const n = new Set(this.oeffnungen.map((a) => a.id));
        let s = this.oeffnungen.length + 1;
        for (; n.has(`o${s}`); ) s++;
        t.id = `o${s}`;
        const i = et(this.umriss, t), r = i && this.data ? Be(this.data.raeume, this.raumId, i) : null;
        r && (t.gegenstueck = r.tuer.key, t.fuehrt_zu = r.tuer.raumId, this.showToast(`Verbunden mit ${this.tuerText(r.tuer)}. Ändern unter „Führt zu“.`)), this.oeffnungen = [...this.oeffnungen, t], this.selOpening = this.oeffnungen.length - 1, this.selected = -1, this.openTab("raum"), this.dirty = !0, this.tool = "auswahl";
      } else
        this.showToast("Etwas weiter an der Wand entlang ziehen (mindestens 20 cm).");
      return;
    }
    if (e?.kind === "rect" && this.rectDraft) {
      const [t, n] = this.rectDraft;
      this.rectDraft = null, Math.abs(t[0] - n[0]) >= 10 && Math.abs(t[1] - n[1]) >= 10 && (this.addZone(gt(t, n)), this.tool = "auswahl");
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
      if (Oe(this.toScreen(n), this.toScreen(s[i]), this.toScreen(s[(i + 1) % s.length])) <= H) {
        this.remember(), this.updateZone(this.selected, { form: mt(t.form, i, this.snapped(n)) });
        return;
      }
  }
  onWheel(e) {
    e.preventDefault(), this.zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, this.toWorld(e));
  }
  // -- Plan zeichnen -------------------------------------------------------------
  renderGrid() {
    const { w: e, h: t } = this.size, n = this.view.scale, s = n > 0.6 ? 50 : n > 0.2 ? 100 : 500, i = [];
    if (this.ansichtWinkel) {
      const l = Math.hypot(e, t) / 2 / n, { cx: c, cy: d } = this.view, g = (p, f, b) => {
        const [$, k] = this.toScreen(p), [_, w] = this.toScreen(f);
        return v`<line class="grid ${b ? "major" : ""}" x1=${$} y1=${k} x2=${_} y2=${w} />`;
      };
      for (let p = Math.floor((c - l) / s) * s; p <= c + l; p += s) i.push(g([p, d - l], [p, d + l], p % 100 === 0));
      for (let p = Math.floor((d - l) / s) * s; p <= d + l; p += s) i.push(g([c - l, p], [c + l, p], p % 100 === 0));
      return v`<g>${i}</g>`;
    }
    const r = this.view.cx - e / 2 / n, a = this.view.cx + e / 2 / n, o = this.view.cy - t / 2 / n, h = this.view.cy + t / 2 / n;
    for (let l = Math.floor(r / s) * s; l <= a; l += s) {
      const [c] = this.toScreen([l, 0]);
      i.push(v`<line class="grid ${l % 100 === 0 ? "major" : ""}" x1=${c} y1="0" x2=${c} y2=${t} />`);
    }
    for (let l = Math.floor(o / s) * s; l <= h; l += s) {
      const [, c] = this.toScreen([0, l]);
      i.push(v`<line class="grid ${l % 100 === 0 ? "major" : ""}" x1="0" y1=${c} x2=${e} y2=${c} />`);
    }
    return v`<g>${i}</g>`;
  }
  renderRoom() {
    if (this.umriss.length < 3) return m;
    const e = this.screenPoints(this.umriss), t = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen, n = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen, s = T({ art: "vieleck", punkte: this.umriss }), i = this.istMelder && !!this.live?.zonen[q]?.belegt;
    return v`<polygon class="floor ${i ? "belegt" : ""}" points=${e} />
      <polygon class="wall" points=${e} />
      ${n.map((r, a) => this.renderOpening(r, a === this.selOpening || r === this.openingDraft, s))}
      ${this.kannAendern && this.tool === "auswahl" && this.oeffnungen[this.selOpening] ? ce(this.umriss, this.oeffnungen[this.selOpening]).map((r) => {
      const [a, o] = this.toScreen(r);
      return v`<circle class="handle opening-griff" cx=${a} cy=${o} r="8" />`;
    }) : m}
      ${t ? v`${this.umriss.map((r) => {
      const [a, o] = this.toScreen(r);
      return v`<circle class="handle" cx=${a} cy=${o} r="5" />`;
    })}
          ${te(this.umriss).map((r) => this.renderPlus(r))}` : m}`;
  }
  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  renderOpening(e, t, n) {
    const [s, i] = ce(this.umriss, e), [r, a] = this.toScreen(s), [o, h] = this.toScreen(i), l = v`<line class="wall-gap" x1=${r} y1=${a} x2=${o} y2=${h} />`;
    if (e.art === "offen")
      return v`<g class="opening ${t ? "selected" : ""}">${l}<line class="opening-line" x1=${r} y1=${a} x2=${o} y2=${h} /></g>`;
    const [c, d, g, p] = e.anschlag === "ende" ? [o, h, r, a] : [r, a, o, h], f = Math.hypot(g - c, p - d) || 1;
    let b = -(p - d) / f, $ = (g - c) / f;
    const [k, _] = this.toScreen(n);
    (k - c) * b + (_ - d) * $ >= 0 !== (e.aufgehen !== "aussen") && (b = -b, $ = -$);
    const M = c + b * f, A = d + $ * f, S = (g - c) * $ - (p - d) * b > 0 ? 0 : 1;
    return v`<g class="opening ${t ? "selected" : ""}">${l}
      <line class="door-leaf" x1=${c} y1=${d} x2=${M} y2=${A} />
      <path class="door-arc" d="M ${M} ${A} A ${f} ${f} 0 0 ${S} ${g} ${p}" /></g>`;
  }
  /** Kleines „+“: hier einen Punkt einfügen. */
  renderPlus(e) {
    const [t, n] = this.toScreen(e);
    return v`<g class="plus"><circle cx=${t} cy=${n} r="6" /><path d="M ${t - 3} ${n} H ${t + 3} M ${t} ${n - 3} V ${n + 3}" /></g>`;
  }
  /** Zellen, die gerade als Bewegungskarte gezeigt werden. */
  heatQuelle() {
    if (this.istMelder) return null;
    if (this.tab === "auswertung" && this.ausw) {
      const e = this.ausw, t = this.auswFigur ? e.figuren.filter((n) => n.figur === this.auswFigur) : e.figuren;
      return { key: `a|${e.bis}|${e.stunden}|${this.auswFigur}`, zellen: _t(t.map((n) => n.zellen)), zelle: e.zelle_cm, sigma: 8 };
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
    if (!e || !e.zellen.length) return m;
    let t = this.heatBildCache;
    if (t?.key !== e.key) {
      const i = zt(e.zellen, e.zelle, e.sigma);
      if (!i) return m;
      const r = document.createElement("canvas");
      r.width = i.nx, r.height = i.ny;
      const a = r.getContext("2d");
      if (!a) return m;
      a.putImageData(new ImageData(Dn(i, this.heatRgb()), i.nx, i.ny), 0, 0), t = { key: e.key, href: r.toDataURL(), x0: i.x0, y0: i.y0, w: i.nx * i.zelle, h: i.ny * i.zelle }, this.heatBildCache = t;
    }
    const [n, s] = this.toScreen([t.x0, t.y0 + t.h]);
    return v`<image class="heat" href=${t.href} x=${n} y=${s} width=${this.px(t.w)} height=${this.px(t.h)} preserveAspectRatio="none" />`;
  }
  /** Stellen des Assistenten als 1, 2, 3 im Plan; dazu die neue Lage des Sensors. */
  renderWizMarken() {
    const e = this.wiz;
    if (!e) return m;
    const t = e.raum.map((i, r) => {
      if (!i) return m;
      const [a, o] = this.toScreen(i), h = r === e.aktiv && e.schritt === "nachher";
      return v`<g class="wiz-marke ${h ? "aktiv" : ""}"><circle cx=${a} cy=${o} r="14" /><text x=${a} y=${o + 5}>${r + 1}</text></g>`;
    }), n = e.ergebnis;
    let s = m;
    if (n) {
      const [i, r] = this.toScreen([n.x, n.y]), a = Math.max(30, this.px(80)), [o, h] = _e(n.winkel);
      s = v`<g class="wiz-neu"><circle cx=${i} cy=${r} r="9" /><line x1=${i} y1=${r} x2=${i + o * a} y2=${r - h * a} /></g>`;
    }
    return v`${t}${s}`;
  }
  /** Lage eines Grundrisses (mit ungespeicherten Änderungen). */
  planLage(e) {
    return this.planAenderung[e.id] ?? { x: e.x, y: e.y, winkel: e.winkel ?? 0, zuschnitt: e.zuschnitt ?? [], cm_pro_px: e.cm_pro_px, stockwerk: e.stockwerk ?? "" };
  }
  /** Bildpunkt → Haus. */
  planZuHaus(e, t, n) {
    const s = this.planLage(e), [i, r] = P([t * s.cm_pro_px, (e.hoehe_px - n) * s.cm_pro_px], s.winkel);
    return [s.x + i, s.y + r];
  }
  /** Haus → Bildpunkt. */
  hausZuPlan(e, t) {
    const n = this.planLage(e), [s, i] = P([t[0] - n.x, t[1] - n.y], -n.winkel);
    return [s / n.cm_pro_px, e.hoehe_px - i / n.cm_pro_px];
  }
  planZuschnitt(e) {
    const t = this.planLage(e).zuschnitt;
    return t.length === 4 ? [t[0], t[1], t[2], t[3]] : [0, 0, e.breite_px, e.hoehe_px];
  }
  /** Größer oder kleiner; `fest` (Haus) bleibt an seinem Platz, sonst die Mitte des Ausschnitts. */
  planSkalieren(e, t, n) {
    const s = this.planLage(e), i = Math.max(0.01, Math.min(100, s.cm_pro_px * t)), [r, a, o, h] = this.planZuschnitt(e), l = n ?? this.planZuHaus(e, (r + o) / 2, (a + h) / 2), [c, d] = this.hausZuPlan(e, l);
    this.planAendern(e, { cm_pro_px: i });
    const g = this.planZuHaus(e, c, d), p = this.planLage(e);
    this.planAendern(e, { x: p.x + l[0] - g[0], y: p.y + l[1] - g[1] });
  }
  planAendern(e, t) {
    this.planAenderung = { ...this.planAenderung, [e.id]: { ...this.planLage(e), ...t } }, this.dirty = !0;
  }
  planDrehen(e, t) {
    const [n, s, i, r] = this.planZuschnitt(e), a = this.planZuHaus(e, (n + i) / 2, (s + r) / 2);
    let h = ((this.planLage(e).winkel + t) % 360 + 540) % 360 - 180;
    h === -180 && (h = 180), this.planAendern(e, { winkel: h });
    const l = this.planZuHaus(e, (n + i) / 2, (s + r) / 2), c = this.planLage(e);
    this.planAendern(e, { x: c.x + a[0] - l[0], y: c.y + a[1] - l[1] });
  }
  async ladePlanBilder() {
    const e = this.data?.plaene ?? [];
    for (const t of e)
      if (!(this.planBilder[t.id] || !this._hass))
        try {
          const n = await this._hass.callWS({ type: `${R}/plan/bild/get`, plan_id: t.id }), s = Uint8Array.from(atob(n.bild), (i) => i.charCodeAt(0));
          this.planBilder = { ...this.planBilder, [t.id]: URL.createObjectURL(new Blob([s], { type: n.mime })) };
        } catch {
        }
  }
  /** Grundrisse als Hintergrund (Hausplan: im Haus; Raum: in den Raum umgerechnet). */
  renderPlanBilder() {
    if (!this.zeigePlan) return m;
    let e = (this.data?.plaene ?? []).filter((s) => this.planBilder[s.id]);
    const t = (s) => this.planLage(s).stockwerk;
    if (this.page === "haus" && (e = e.filter((s) => s.id === this.planEdit || !t(s) || t(s) === this.stockwerk)), this.page === "raum" && this.raum) {
      const s = this.stockwerkeVon(this.raum);
      s.length && (e = e.filter((i) => !t(i) || s.includes(t(i))));
    }
    if (!e.length) return m;
    let n = null;
    if (this.page === "raum") {
      const s = this.raum;
      if (!s?.haus_gesetzt) return m;
      const i = { x: s.haus_x, y: s.haus_y, winkel: s.haus_winkel };
      n = (r) => _n(r, i);
    }
    return v`${e.map((s) => {
      const i = ($, k) => {
        const _ = this.planZuHaus(s, $, k);
        return this.toScreen(n ? n(_) : _);
      }, [r, a, o] = [i(0, 0), i(1, 0), i(0, 1)], h = [a[0] - r[0], a[1] - r[1], o[0] - r[0], o[1] - r[1], r[0], r[1]].map(($) => $.toFixed(5)).join(" "), [l, c, d, g] = this.planZuschnitt(s), p = this.page === "haus" && this.planEdit === s.id, f = p ? [
        [l, c],
        [d, c],
        [d, g],
        [l, g]
      ].map(([$, k]) => {
        const [_, w] = i($, k);
        return v`<circle class="handle plan-griff" cx=${_} cy=${w} r="9" />`;
      }) : m, b = p ? v`<polygon class="plan-rahmen" points=${Pt([i(l, c), i(d, c), i(d, g), i(l, g)])} />` : m;
      return v`<g transform="matrix(${h})">
          <clipPath id=${`zuschnitt-${s.id}`}><rect x=${l} y=${c} width=${d - l} height=${g - c} /></clipPath>
          <image class="plan-hintergrund ${p ? "edit" : ""}" href=${this.planBilder[s.id]} x="0" y="0" width=${s.breite_px} height=${s.hoehe_px} preserveAspectRatio="none" clip-path=${`url(#zuschnitt-${s.id})`} />
        </g>
        ${b}${f}`;
    })}`;
  }
  /** Maße der Wände (und Öffnungen), wenn eingeschaltet. */
  renderMasse() {
    if (!this.masse || this.umriss.length < 3) return m;
    const e = this.umriss.length, t = T({ art: "vieleck", punkte: this.umriss }), n = this.umriss.map((i, r) => {
      const a = this.umriss[(r + 1) % e], o = Math.hypot(a[0] - i[0], a[1] - i[1]);
      if (o < 20) return m;
      const h = [(i[0] + a[0]) / 2, (i[1] + a[1]) / 2];
      let l = -(a[1] - i[1]) / o, c = (a[0] - i[0]) / o;
      (t[0] - h[0]) * l + (t[1] - h[1]) * c > 0 && ([l, c] = [-l, -c]);
      const [d, g] = this.toScreen(h), p = 26, [f, b] = [d + l * p, g - c * p];
      return v`<text class="mass-text" x=${f} y=${b} dy="0.35em">${Et(o)} m</text>`;
    }), s = this.oeffnungen.map((i) => {
      const [r, a] = ce(this.umriss, i), [o, h] = this.toScreen([(r[0] + a[0]) / 2, (r[1] + a[1]) / 2]);
      return v`<text class="mass-text klein" x=${o} y=${h} dy="-0.8em">${Et(i.bis - i.von)}</text>`;
    });
    return v`<g>${n}${s}</g>`;
  }
  melderPlatzieren(e) {
    this.remember();
    const t = this.umriss.length >= 3 ? T({ art: "vieleck", punkte: this.umriss }) : [0, 0], n = Object.keys(this.melderLagen).length;
    this.melderLagen = { ...this.melderLagen, [e]: { x: Math.round(t[0] + n * 40), y: Math.round(t[1]), winkel: 0, reichweite_cm: 500, oeffnung_grad: 100 } }, this.dirty = !0, this.showToast("Melder in die Raummitte gesetzt: an seinen Platz ziehen und am Griff drehen.");
  }
  /** Anzeigename eines Melders (aus der Liste der Kandidaten, sonst die Kennung). */
  melderName(e) {
    return this.kandidaten?.melder.find((n) => n.id === e || n.entity_id === e)?.name ?? "Unbekannter Melder";
  }
  melderLageAendern(e, t) {
    const n = this.melderLagen[e];
    n && (this.melderLagen = { ...this.melderLagen, [e]: { ...n, ...t } }, this.dirty = !0);
  }
  /** Erfassung eines platzierten Melders: rundum (Decke) oder gerichtet (Wand), Reichweite. */
  renderMelderErfassung(e) {
    const t = this.melderLagen[e];
    if (!t) return m;
    const n = t.oeffnung_grad >= 360;
    return u`<div class="melder-erfassung">
      <div class="levels" role="group" aria-label="Erfassung">
        <button class=${n ? "active" : ""} @click=${() => this.melderLageAendern(e, { oeffnung_grad: 360 })}>
          <ha-icon icon="mdi:circle-outline"></ha-icon>Rundum (Decke)
        </button>
        <button class=${n ? "" : "active"} @click=${() => this.melderLageAendern(e, { oeffnung_grad: n ? 100 : t.oeffnung_grad })}>
          <ha-icon icon="mdi:angle-acute"></ha-icon>Gerichtet (Wand)
        </button>
      </div>
      ${n ? m : u`<div class="levels" role="group" aria-label="Öffnung">
            ${[60, 90, 120, 150].map(
      (s) => u`<button class=${Math.round(t.oeffnung_grad) === s ? "active" : ""} @click=${() => this.melderLageAendern(e, { oeffnung_grad: s })}>${s}°</button>`
    )}
          </div>`}
      <label class="field"
        >Reichweite<input
          type="number"
          min="0.5"
          max="15"
          step="0.5"
          .value=${String(t.reichweite_cm / 100)}
          @change=${(s) => {
      const i = Number(s.target.value.replace(",", "."));
      Number.isFinite(i) && i > 0 && this.melderLageAendern(e, { reichweite_cm: Math.round(Math.max(50, Math.min(1500, i * 100))) });
    }}
        /><span class="unit">m</span></label
      >
      <p class="hint small">${n ? "Erfasst ringsum, z. B. an der Decke." : "Erfasst nur nach vorne; am gelben Griff im Plan drehen."}</p>
    </div>`;
  }
  melderGriff(e) {
    const [t, n] = _e(e.winkel), s = 40 / this.view.scale;
    return [e.x + t * s, e.y + n * s];
  }
  /** Melder im Plan: Punkt mit Sichtbereich, ziehen und am Griff drehen. */
  renderMelderLagen() {
    const e = Object.entries(this.melderLagen).filter(([t]) => this.melder.includes(t));
    return e.length ? v`${e.map(([t, n]) => {
      const [s, i] = this.toScreen([n.x, n.y]), [r, a] = this.toScreen(this.melderGriff(n));
      return v`<g class="melder-lage">
        <polygon class="coverage" points=${this.screenPoints(Ie([n.x, n.y], n.winkel, n.reichweite_cm, n.oeffnung_grad))} />
        ${this.kannAendern && n.oeffnung_grad < 360 ? v`<line class="sensor-line" x1=${s} y1=${i} x2=${r} y2=${a} /><circle class="handle angle" cx=${r} cy=${a} r="7" />` : m}
        <circle class="melder-punkt" cx=${s} cy=${i} r="9" />
        <text class="label sub" x=${s} y=${i + 24}>${this.melderName(t)}</text>
      </g>`;
    })}` : m;
  }
  /** Melder-Raum: in der Mitte steht, ob jemand da ist. */
  renderMelderLabel() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[q]?.belegt, s = this.umriss.length >= 3 ? T({ art: "vieleck", punkte: this.umriss }) : [0, 0], [i, r] = this.toScreen(s);
    return v`<text class="label room" x=${i} y=${r}>${t ? n ? "jemand da" : "niemand" : "Melder nicht erreichbar"}</text>
      ${this.umriss.length < 3 ? v`<text class="label sub" x=${i} y=${r + 18}>Wände zeichnen: Werkzeug links</text>` : m}`;
  }
  renderCoverage() {
    if (!this.layers.abdeckung) return m;
    const e = this.sensor;
    return v`<polygon class="coverage" points=${this.screenPoints(Ie([e.x, e.y], e.winkel, e.reichweite_cm, e.oeffnung_grad))} />`;
  }
  renderZone(e, t) {
    const n = (e.id ? this.live?.zonen[e.id]?.belegt : !1) ?? !1, s = he(e), i = de(s), r = t === this.selected, a = n ? 0.5 : 0.2;
    let o;
    if (e.form.art === "zellen")
      o = v`${Ye(e.form).map((h) => {
        const l = [
          [h.x, h.y],
          [h.x + h.s, h.y],
          [h.x + h.s, h.y + h.s],
          [h.x, h.y + h.s]
        ];
        return v`<polygon class="zone-shape ${r ? "selected" : ""}" points=${this.screenPoints(l)} fill=${i} fill-opacity=${a} stroke=${i} style="stroke-width:1" />`;
      })}`;
    else {
      const h = this.screenPoints(j(e.form)), l = r && e.regel.rand_cm > 0 ? this.px(e.regel.rand_cm * 2) : 0;
      o = v`
        ${l ? v`<mask id="rz-band-${t}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${h} fill="black" />
              </mask>
              <polygon points=${h} fill="none" stroke=${i} stroke-opacity="0.25" stroke-width=${l} stroke-linejoin="round" mask="url(#rz-band-${t})" />` : m}
        <polygon class="zone-shape ${r ? "selected" : ""}" points=${h} fill=${i} fill-opacity=${a} stroke=${i} />`;
    }
    return v`<g>${o}</g>`;
  }
  /** Beschriftung der Zone; wird nach den Figuren gezeichnet, damit sie lesbar bleibt. */
  renderZoneLabel(e) {
    const t = e.id ? this.live?.zonen[e.id] : void 0, [n, s] = this.toScreen(T(e.form)), i = t ? t.belegt ? `belegt${t.personen > 1 ? ` · ${t.personen}` : ""}` : "frei" : "neu";
    return v`<text class="label" x=${n} y=${s - 2}>${e.name}</text>
      <text class="label sub" x=${n} y=${s + 14}>${i}</text>`;
  }
  renderHandles() {
    const e = this.zones[this.selected];
    if (!e || this.tool !== "auswahl" || !this.kannAendern) return m;
    let t = [];
    e.form.art === "vieleck" ? t = e.form.punkte : e.form.art === "rechteck" && (t = ze(e.form.mitte, e.form.breite, e.form.tiefe, e.form.winkel));
    let n = m;
    if (e.form.art !== "zellen") {
      const [s, i] = this.toScreen(T(e.form)), [r, a] = this.toScreen(this.zoneRotateHandle(e.form));
      n = v`<line class="sensor-line" x1=${s} y1=${i} x2=${r} y2=${a} /><circle class="handle angle" cx=${r} cy=${a} r="8"><title>Drehen</title></circle>`;
    }
    return v`${n}
      ${e.form.art === "vieleck" ? te(e.form.punkte).map((s) => this.renderPlus(s)) : m}
      ${t.map((s, i) => {
      const [r, a] = this.toScreen(s), o = e.form.art === "vieleck" && i === this.selVertex;
      return v`<rect class="handle ${o ? "on" : ""}" x=${r - 5} y=${a - 5} width="10" height="10" rx="2" />`;
    })}`;
  }
  renderSensor() {
    const e = this.sensor, [t, n] = this.toScreen([e.x, e.y]), [s, i] = this.toScreen(this.sensorHandle()), r = -e.winkel * Math.PI / 180, a = [4.5, 7.5].map((o) => {
      const h = r - Math.PI / 2 - 0.7, l = r - Math.PI / 2 + 0.7;
      return v`<path class="sensor-wave" d="M ${t + o * Math.cos(h)} ${n + o * Math.sin(h)} A ${o} ${o} 0 0 1 ${t + o * Math.cos(l)} ${n + o * Math.sin(l)}" />`;
    });
    return v`<g>
      ${this.kannAendern ? v`<line class="sensor-line" x1=${t} y1=${n} x2=${s} y2=${i} />
            <circle class="handle angle" cx=${s} cy=${i} r="8" />` : m}
      <circle class="sensor-body" cx=${t} cy=${n} r="12" />
      ${a}
    </g>`;
  }
  renderLive() {
    const e = this.live;
    if (!e) return m;
    const t = [];
    if (this.layers.ziele)
      for (const [, n, s] of e.ziele) {
        const [i, r] = this.toScreen([n, s]);
        t.push(v`<path class="target" d="M${i - 4} ${r - 4} L${i + 4} ${r + 4} M${i - 4} ${r + 4} L${i + 4} ${r - 4}" />`);
      }
    for (const n of e.figuren) {
      if (n.tags.includes("wiederhergestellt") || n.tags.includes("stoerung")) continue;
      const s = n.tags.includes("hund") || n.art === "pet", i = s ? "var(--rz-tier)" : "var(--rz-person)";
      if (this.layers.spuren && n.spur.length > 1 && t.push(v`<polyline class="trail" points=${this.screenPoints(n.spur)} stroke=${i} />`), !this.layers.figuren) continue;
      const [r, a] = this.toScreen([n.x, n.y]), o = Math.max(7, this.px(14));
      t.push(v`<circle class="figure ${n.gehalten ? "held" : ""}" cx=${r} cy=${a} r=${o} fill=${i} stroke=${n.gehalten ? i : "var(--card)"} />`), (s || n.gehalten) && t.push(v`<text class="label sub" x=${r} y=${a - o - 5}>${s ? "Hund?" : "gehalten"}</text>`);
    }
    return v`<g>${t}</g>`;
  }
  renderDraft() {
    if (this.rectDraft) {
      const s = gt(...this.rectDraft);
      if (s.art !== "rechteck") return m;
      const [i, r] = this.toScreen(s.mitte);
      return v`<polygon class="draft" points=${this.screenPoints(ze(s.mitte, s.breite, s.tiefe, 0))} />
        <text class="label" x=${i} y=${r + 5}>${(s.breite / 100).toFixed(2)} × ${(s.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return m;
    const e = this.hover ? [...this.draft, this.hover] : this.draft, [t, n] = this.toScreen(this.draft[0]);
    return v`<polyline class="draft" points=${this.screenPoints(e)} style="fill:none" />
      ${this.draft.map((s) => {
      const [i, r] = this.toScreen(s);
      return v`<circle class="draft-dot" cx=${i} cy=${r} r="4" />`;
    })}
      ${this.draft.length >= 3 ? v`<circle class="close-ring" cx=${t} cy=${n} r=${H} />` : m}`;
  }
  /** Stockwerke eines Raums: eigene Angabe, sonst das Stockwerk seines Bereichs. */
  stockwerkeVon(e) {
    const t = this.hausExtra[e.id], n = t?.stockwerke ?? e.stockwerke ?? [];
    if (n.length) return n;
    const s = t?.bereich_id ?? e.bereich_id, i = this.data?.bereiche_ha ?? [], r = s ? i.find((a) => a.id === s) : i.find((a) => a.name.toLowerCase() === e.name.trim().toLowerCase());
    return r?.stockwerk ? [r.stockwerk] : [];
  }
  /** Raum auf dem gewählten Stockwerk? (Räume ohne Stockwerk nur unter „Alle“.) */
  aufStockwerk(e) {
    return this.stockwerk ? this.stockwerkeVon(e).includes(this.stockwerk) : !0;
  }
  hausRaeume() {
    return (this.data?.raeume ?? []).filter((e) => this.aufStockwerk(e));
  }
  hausRoomAt(e) {
    const t = this.hausRaeume();
    for (let n = t.length - 1; n >= 0; n--) {
      const s = t[n], i = this.lagen[s.id];
      if (i && He(e, { art: "vieleck", punkte: this.outlineOf(s).map((r) => Z(r, i)) })) return s.id;
    }
    return "";
  }
  /** Mitte einer Tür im Haus. */
  renderHausPlan() {
    const e = this.hausRaeume(), t = [], n = [], s = [], i = [];
    for (const o of e) {
      const h = this.lagen[o.id];
      if (!h) continue;
      const l = this.outlineOf(o).map((k) => Z(k, h)), c = o.id === this.hausSel, d = this.hausLive[o.id], g = o.art === "melder" && !!d?.zonen[q]?.belegt;
      t.push(v`<polygon class="floor ${g ? "belegt" : ""}" points=${this.screenPoints(l)} />
        <polygon class="wall ${o.umriss.length >= 3 ? "" : "guess"} ${c ? "selected" : ""}" points=${this.screenPoints(l)} />`);
      for (const k of o.zonen) {
        const _ = he(k);
        if (_ === "ignorieren") continue;
        const w = (k.id ? d?.zonen[k.id]?.belegt : !1) ?? !1, M = j(k.form).map((A) => Z(A, h));
        t.push(v`<polygon class="zone-shape" points=${this.screenPoints(M)} fill=${de(_)} fill-opacity=${w ? 0.5 : 0.18} stroke=${de(_)} />`);
      }
      for (const k of N(o)) {
        const _ = this.tueren[k.key] ?? "", w = _.startsWith("tuer:") ? _.slice(5) : "", M = w ? w.split("/")[0] : _, [A, S] = this.toScreen(Z(k.punkt, h));
        if (M === "aussen")
          s.push(v`<text class="label sub" x=${A} y=${S - 10}>nach draußen</text>`);
        else if (M) {
          const L = e.find((D) => D.id === M);
          if (!L) continue;
          const I = w ? N(L).find((D) => D.key === w) : N(L).find((D) => this.tueren[D.key] === o.id || this.tueren[D.key] === `tuer:${k.key}`);
          if (I && o.id > L.id) continue;
          const B = this.lagen[L.id];
          if (!B) continue;
          const ae = Z(I ? I.punkt : T({ art: "vieleck", punkte: this.outlineOf(L) }), B), [Q, oe] = this.toScreen(ae);
          n.push(v`<line class="link" x1=${A} y1=${S} x2=${Q} y2=${oe} />
            <circle class="link-dot" cx=${A} cy=${S} r="5" /><circle class="link-dot" cx=${Q} cy=${oe} r="5" />`);
        }
      }
      const [p, f] = this.toScreen(T({ art: "vieleck", punkte: l })), b = d ? d.figuren.filter((k) => !k.tags.includes("wiederhergestellt") && !k.tags.includes("stoerung")).length : 0, $ = !d || d.problem || !d.verfuegbar ? "nicht erreichbar" : o.art === "melder" ? g ? "jemand da" : "niemand" : b ? `${b} ${b === 1 ? "Person" : "Personen"}` : "niemand";
      if (s.push(v`<text class="label room" x=${p} y=${f}>${o.name}</text>
        <text class="label sub" x=${p} y=${f + 16}>${$}</text>`), o.art !== "melder")
        for (const k of d?.figuren ?? []) {
          if (k.tags.includes("wiederhergestellt") || k.tags.includes("stoerung")) continue;
          const w = k.tags.includes("hund") || k.art === "pet" ? "var(--rz-tier)" : "var(--rz-person)", [M, A] = this.toScreen(Z([k.x, k.y], h)), S = Math.max(6, this.px(14));
          i.push(v`<circle class="figure ${k.gehalten ? "held" : ""}" cx=${M} cy=${A} r=${S} fill=${w} stroke=${k.gehalten ? w : "var(--card)"} />`);
        }
    }
    const r = this.planMessen?.punkte ?? [], a = v`${r.length === 2 ? v`<line class="plan-strecke-linie" x1=${this.toScreen(r[0])[0]} y1=${this.toScreen(r[0])[1]} x2=${this.toScreen(r[1])[0]} y2=${this.toScreen(r[1])[1]} />` : m}${r.map((o) => {
      const [h, l] = this.toScreen(o);
      return v`<circle class="plan-strecke" cx=${h} cy=${l} r="6" />`;
    })}`;
    return v`${this.renderPlanBilder()}${t}${n}${i}${s}${a}`;
  }
  renderScalebar() {
    const e = us(90 / this.view.scale), t = e >= 100 ? `${e / 100} m` : `${e} cm`;
    return u`<div class="scalebar"><div style="width:${this.px(e)}px"></div>${t}</div>`;
  }
  renderBubble() {
    const e = cs[this.tool];
    if (e) {
      const t = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return u`<div class="bubble">
        <ha-icon icon=${Rt.find((n) => n.tool === this.tool).icon}></ha-icon>
        <span class="grow">${e}</span>
        ${t ? u`<button class="text" @click=${this.finishDraft}>Fertig</button>` : m}
        <button class="text" @click=${() => this.setTool("auswahl")}>${this.tool === "zellen" ? "Fertig" : "Abbrechen"}</button>
      </div>`;
    }
    return this.kannAendern ? this.istMelder ? this.umriss.length >= 3 || this.tool !== "auswahl" ? m : u`<div class="bubble">
        <ha-icon icon="mdi:wall"></ha-icon>
        <span class="grow">Links mit <b>Wände zeichnen</b> den Umriss des Raums einzeichnen, dann Türen in die Wände. So passt er in den Hausplan.</span>
      </div>` : !this.zones.length && this.tool === "auswahl" ? u`<div class="bubble">
        <ha-icon icon="mdi:gesture-tap"></ha-icon>
        <span class="grow">Zuerst den <b>Sensor</b> an seinen Platz ziehen und am gelben Griff drehen. Dann links ein Werkzeug wählen und die erste Zone zeichnen.</span>
      </div>` : m : m;
  }
  renderLayers() {
    if (!this.layersOpen) return m;
    const e = (n, s) => u`<label class="check"
        ><input
          type="checkbox"
          .checked=${this.layers[n]}
          @change=${(i) => this.layers = { ...this.layers, [n]: i.target.checked }}
        /><span>${s}</span></label
      >`, t = (n, s) => u`<button
        class=${this.heatMin === n ? "active" : ""}
        @click=${() => {
      this.heatMin = n, this.loadHeat();
    }}
      >
        ${s}
      </button>`;
    return u`<div class="layers" @pointerdown=${(n) => n.stopPropagation()}>
      ${e("figuren", "Figuren live")} ${e("spuren", "Spuren der letzten Sekunden")}
      ${e("abdeckung", "Abdeckung des Sensors")} ${e("ziele", "Rohpunkte des Sensors")}
      <div class="label-text">Bewegungskarte: wo war jemand?</div>
      <div class="levels">${t(0, "aus")}${t(15, "15 min")}${t(60, "1 h")}${t(1440, "24 h")}</div>
      <p class="hint small">Zählt seit dem letzten Neustart von Home Assistant.${this.kannAendern ? " Länger zurück und feiner: Reiter „Auswertung“." : ""}</p>
    </div>`;
  }
  renderStage() {
    const e = this.tool === "zellen" ? "painting" : this.tool === "auswahl" ? "" : "drawing";
    return u`<div class="stage">
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
        ${this.page === "haus" ? this.renderHausPlan() : this.istMelder ? v`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderMelderLagen()}
              ${this.zones.map((t, n) => this.renderZone(t, n))} ${this.zones.map((t) => this.renderZoneLabel(t))}
              ${this.renderMelderLabel()} ${this.renderHandles()} ${this.renderDraft()}` : v`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((t, n) => this.renderZone(t, n))} ${this.renderLive()}
              ${this.zones.map((t) => this.renderZoneLabel(t))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()} ${this.renderWizMarken()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(t) => t.stopPropagation()}>
        ${this.kannAendern && this.page === "raum" ? u`${Rt.filter((t) => !this.istMelder || hs.includes(t.tool)).map(
      (t) => u`<button class="icon ${this.tool === t.tool ? "on" : ""}" title=${t.label} aria-label=${t.label} @click=${() => this.setTool(t.tool)}>
                  <ha-icon icon=${t.icon}></ha-icon>
                </button>`
    )}
              <span class="sep"></span>` : m}
        ${this.page === "raum" && !this.istMelder ? u`<button class="icon ${this.layersOpen ? "on" : ""}" title="Ebenen und Bewegungskarte" aria-label="Ebenen" @click=${() => this.layersOpen = !this.layersOpen}>
                <ha-icon icon="mdi:layers-outline"></ha-icon>
              </button>
              <span class="sep"></span>` : m}
        ${this.data?.plaene?.length ? u`<button
              class="icon ${this.zeigePlan ? "on" : ""}"
              title="Grundriss im Hintergrund"
              aria-label="Grundriss im Hintergrund"
              @click=${() => {
      this.zeigePlan = !this.zeigePlan, We("raumzonen-zeige-plan", this.zeigePlan);
    }}
            >
              <ha-icon icon="mdi:image-outline"></ha-icon>
            </button>` : m}
        ${this.page === "raum" ? u`<button
              class="icon ${this.masse ? "on" : ""}"
              title="Maße der Wände"
              aria-label="Maße der Wände"
              @click=${() => {
      this.masse = !this.masse, We("raumzonen-masse", this.masse);
    }}
            >
              <ha-icon icon="mdi:ruler"></ha-icon>
            </button>` : m}
        ${this.page === "raum" && this.raum?.haus_gesetzt && Math.abs(this.raum.haus_winkel ?? 0) > 0.01 ? u`<button
              class="icon ${this.wieImHaus ? "on" : ""}"
              title=${this.wieImHaus ? "Ansicht wie im Hausplan (tippen: Raum gerade)" : "Raum gerade (tippen: wie im Hausplan)"}
              aria-label="Ansicht drehen"
              @click=${() => {
      this.wieImHaus = !this.wieImHaus, We("raumzonen-wie-im-haus", this.wieImHaus), this.viewTouched = !1, this.fit();
    }}
            >
              <ha-icon icon="mdi:rotate-3d-variant"></ha-icon>
            </button>` : m}
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
      ${this.page === "raum" ? u`${this.renderLayers()} ${this.renderBubble()}` : m} ${this.renderScalebar()}
    </div>`;
  }
  // -- Seitenleiste ------------------------------------------------------------
  renderZoneItem(e, t) {
    const n = t === this.selected, s = he(e), i = Me(s), r = e.id ? this.live?.zonen[e.id] : void 0, a = r ? u`<span class="badge ${r.belegt ? "on" : "off"}">${r.belegt ? r.personen > 1 ? `belegt · ${r.personen}` : "belegt" : "frei"}</span>` : u`<span class="badge new">neu</span>`;
    return u`<li class="item ${n ? "open" : ""}" style="--zone:${de(s)}">
      <div class="row" @click=${() => this.select(n ? -1 : t)}>
        <span class="dot"></span>
        <ha-icon icon=${i.icon}></ha-icon>
        <span class="name">${e.name}</span>
        ${a}
      </div>
      ${n ? this.renderInspector(e, t) : m}
    </li>`;
  }
  renderInspector(e, t) {
    const n = e.regel, s = he(e), i = this.data.grenzen, r = (c, d, g, p, f) => u`<label class="field"
        >${d}<input
          type="number"
          min="0"
          max=${p}
          step=${f}
          .value=${String(n[c])}
          @change=${(b) => {
      const $ = Number(b.target.value);
      Number.isFinite($) && this.updateRegel(t, { [c]: Math.max(0, Math.min(p, $)) });
    }}
        /><span class="unit">${g}</span></label
      >`, a = (c, d, g, p) => u`<label class="check"
        ><input type="checkbox" .checked=${g} @change=${(f) => p(f.target.checked)} /><span
          >${c}<small>${d}</small></span
        ></label
      >`, o = je(e.form), h = (this.data?.raeume ?? []).filter((c) => c.id !== this.raumId), l = this.istMelder ? u`<div class="label-text">Welcher Melder meldet diese Zone?</div>
          <ul class="melder-liste">
            ${this.melder.map(
      (c) => u`<li>
                <label class="check"
                  ><input
                    type="checkbox"
                    .checked=${(e.melder ?? []).includes(c)}
                    @change=${(d) => {
        const g = d.target.checked, p = (e.melder ?? []).filter((f) => f !== c);
        this.updateZone(t, { melder: g ? [...p, c] : p });
      }}
                  /><span>${this.melderName(c)}</span></label
                >
              </li>`
    )}
          </ul>
          ${(e.melder ?? []).length ? m : u`<p class="note warn">Ohne Melder lässt sich die Zone nicht speichern.</p>`}` : m;
    return this.kannAendern ? u`<div class="inspector">
      ${l}
      <label class="field"
        >Name<input
          type="text"
          .value=${e.name}
          @change=${(c) => {
      this.remember(), this.updateZone(t, { name: c.target.value });
    }}
      /></label>
      <div class="label-text">Wofür ist die Zone?</div>
      <div class="levels">
        ${Ue.map(
      (c) => u`<button class=${c.rolle === s ? "active" : ""} @click=${() => this.setRolle(t, c.rolle)}>
            <ha-icon icon=${c.icon}></ha-icon>${c.name}
          </button>`
    )}
      </div>
      <p class="hint small">${Me(s).text}</p>
      ${s === "tuer" ? u`<label class="field"
              >Wohin führt die Tür?<select
                @change=${(c) => {
      this.remember(), this.updateZone(t, { fuehrt_zu: c.target.value });
    }}
              >
                <option value="" ?selected=${!e.fuehrt_zu}>weiß nicht</option>
                <option value="aussen" ?selected=${e.fuehrt_zu === "aussen"}>nach draußen / Raum ohne Sensor</option>
                ${h.map((c) => u`<option value=${c.id} ?selected=${e.fuehrt_zu === c.id}>${c.name}</option>`)}
              </select></label
            >
            <p class="hint small">Damit weiß Raumzonen später, wer von wo nach wo geht.</p>` : m}
      ${s === "bett" ? u`${a(
      "Nur eine Person im Bett",
      "Dann wird ein starrer Punkt, den der Sensor beim Aufstehen zurücklässt, verworfen.",
      n.max_personen === 1,
      (c) => this.updateRegel(t, { max_personen: c ? 1 : 0 })
    )}
          ${a(
      "Hund nicht mitzählen",
      "Nur ein Hinweis; ob es der Hund ist, ergibt sich aus Hundeplätzen oder der Art, die der Sensor meldet.",
      n.hund_ignorieren,
      (c) => this.updateRegel(t, { hund_ignorieren: c })
    )}` : m}
      ${s !== "ignorieren" ? u`<div class="summary">${vt(e)}</div>
            <details class="fine">
              <summary>Feineinstellung</summary>
              <div class="fields">
                ${r("belegt_nach_s", "Belegt nach", "s", i.belegt_nach_s, 0.5)} ${r("frei_nach_s", "Frei nach", "s", i.frei_nach_s, 0.5)}
              </div>
              ${r("rand_cm", "Randstreifen (gegen Zittern am Rand)", "cm", i.rand_cm, 5)}
              ${n.schlaefer_halten ? u`<p class="hint small">Als „aufgestanden“ gilt erst, wer sich draußen bewegt, weit genug weg ist oder zur Tür geht:</p>
                    <div class="fields">
                      ${r("weg_rahmen", "Bewegte Meldungen", "", i.weg_rahmen, 1)} ${r("weg_cm", "oder Abstand", "cm", i.weg_cm, 5)}
                    </div>` : m}
            </details>` : m}
      ${e.form.art !== "zellen" ? u`<div class="label-text">Form</div>
            <div class="actions">
              <button class="text small" title="Gegen den Uhrzeigersinn" @click=${() => this.turnZone(t, 15)}><ha-icon icon="mdi:rotate-left"></ha-icon>15°</button>
              <button class="text small" title="Im Uhrzeigersinn" @click=${() => this.turnZone(t, -15)}><ha-icon icon="mdi:rotate-right"></ha-icon>15°</button>
              ${e.form.art === "vieleck" ? u`<button class="text small" ?disabled=${this.selVertex < 0 || e.form.punkte.length <= 3} @click=${() => this.deleteVertex(t, this.selVertex)}>
                    <ha-icon icon="mdi:vector-point-minus"></ha-icon>Punkt löschen
                  </button>` : m}
            </div>
            <p class="hint small">
              Am gelben Griff drehen. ${e.form.art === "vieleck" ? "Das „+“ auf einer Kante fügt einen Punkt ein; Rechtsklick auf einen Punkt löscht ihn." : ""}
            </p>` : u`<div class="label-text">Form</div>
            <div class="actions">
              <button
                class="text small ${this.tool === "zellen" && this.selected === t ? "on" : ""}"
                @click=${() => {
      this.selected = t, this.setTool(this.tool === "zellen" ? "auswahl" : "zellen");
    }}
              >
                <ha-icon icon="mdi:grid"></ha-icon>${this.tool === "zellen" && this.selected === t ? "Fertig" : "Zellen bearbeiten"}
              </button>
            </div>
            <p class="hint small">
              Beim Bearbeiten: leere Zelle antippen oder darüberziehen = dazu, volle Zelle = weg. Die ganze Zone verschieben: in der Auswahl ziehen.
            </p>`}
      ${o ? u`<div class="note warn">${o}</div>` : m}
      <div class="actions">
        <span class="spacer"></span>
        <button class="text danger" @click=${() => this.deleteZone(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
      </div>
    </div>` : u`<div class="inspector">
        <p class="hint small">${Me(s).text}</p>
        ${s === "tuer" ? u`<div class="summary">Führt ${Ln(e, h)}.</div>` : m}
        ${s !== "ignorieren" ? u`<div class="summary">${vt(e)}</div>` : m}
      </div>`;
  }
  renderZonesTab() {
    return u`
      ${this.zones.length ? u`<ul class="list">
            ${this.zones.map((e, t) => this.renderZoneItem(e, t))}
          </ul>` : u`<p class="hint">
            ${this.kannAendern ? this.istMelder ? "Noch keine Zonen. Eine Zone ist der Bereich, den ein Melder meldet (z. B. eine Zone eines FP2). Unter „Melder und Raum“ beim Melder „Zone für diesen Melder“ tippen, oder hier links zeichnen und dann den Melder wählen. „Anwesenheit“ für den ganzen Raum gibt es immer." : "Noch keine Zonen. Mit den Werkzeugen links am Plan zeichnen, z. B. ein Rechteck über das Bett." : "Noch keine Zonen eingezeichnet."}
          </p>`}
      ${this.kannAendern ? this.renderNewZone() : m}`;
  }
  renderNewZone() {
    return u`<h3>Neue Zone</h3>
      <div class="actions">
        <button class="text small" @click=${() => this.setTool("rechteck")}><ha-icon icon="mdi:rectangle-outline"></ha-icon>Rechteck</button>
        <button class="text small" @click=${() => this.setTool("vieleck")}><ha-icon icon="mdi:vector-polygon"></ha-icon>Vieleck</button>
        <button
          class="text small"
          @click=${() => {
      this.selected = -1, this.setTool("zellen");
    }}
        >
          <ha-icon icon="mdi:grid"></ha-icon>Zellen
        </button>
      </div>
      ${this.istMelder ? m : u`<div class="actions">
            <button class="text small" @click=${this.importConverter}><ha-icon icon="mdi:import"></ha-icon>Aus dem Konverter übernehmen</button>
            ${this.offeneTueren().length ? u`<button class="text small" @click=${() => this.tuerZonenAnlegen()}>
                  <ha-icon icon="mdi:door-sliding"></ha-icon>Tür-Zonen anlegen (${this.offeneTueren().length})
                </button>` : m}
          </div>`}`;
  }
  /** Türen in den Wänden, vor denen noch keine Tür-Zone liegt. */
  offeneTueren() {
    if (!this.raum || this.istMelder || this.umriss.length < 3) return [];
    const e = { ...this.raum, umriss: this.umriss, zonen: this.zones };
    return this.oeffnungen.map((t, n) => Kn(e, t) ? -1 : n).filter((t) => t >= 0);
  }
  /**
   * Vor jede Tür eine Zone mit der Rolle „Tür“: damit erkennt Raumzonen
   * „betreten“ und „verlassen“ und verfolgt Wege von Raum zu Raum.
   */
  tuerZonenAnlegen() {
    if (!this.data) return;
    this.remember();
    let e = [...this.zones], t = 0;
    for (const n of this.offeneTueren()) {
      const s = this.oeffnungen[n], i = Gn(this.umriss, s);
      if (!i) continue;
      let r = $t(pt(i, e, this.data.vorlagen), "tuer", this.data.vorlagen);
      r = { ...r, name: Se(s, n), fuehrt_zu: s.fuehrt_zu ?? "" }, e = [...e, r], t++;
    }
    this.zones = e, this.dirty = t > 0 || this.dirty, this.showToast(t ? `${t} Tür-${t === 1 ? "Zone" : "Zonen"} angelegt. Prüfen und „Speichern“.` : "Keine Tür ohne Tür-Zone gefunden.");
  }
  renderMelderTab() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[q]?.belegt, s = this.kandidaten, i = (l) => s?.melder.find((c) => c.id === l || c.entity_id === l)?.name ?? l, r = (s?.melder ?? []).filter((l) => !l.benutzt_von || l.benutzt_von === this.raumId || this.melder.includes(l.id)), a = this.melder.filter((l) => !r.some((c) => c.id === l || c.entity_id === l)).map((l) => ({ id: l, entity_id: l, name: "Unbekannter Melder", klasse: "", bereich_id: null, benutzt_von: this.raumId, geraet: null, typ: "nicht mehr in Home Assistant (gelöscht oder abgeschaltet), bitte abwählen" })), o = this.melderAuswahl([...r, ...a], this.raum?.bereich_id, this.melder), h = this.kannAendern ? this.radarFuerRaum() : null;
    return u`${h ? u`<div class="note">
            <p>
              Hier hängt der Radarsensor „${h.name}“. Als <b>Radar-Raum</b> sieht Raumzonen, wo genau jemand ist, und übernimmt die Zonen aus der
              Zonen-Karte. Wände, Türen, Lage im Haus und „Anwesenheit“ bleiben.
            </p>
            <div class="actions">
              <span class="spacer"></span>
              <button class="text small" ?disabled=${this.saving} @click=${() => void this.umwandeln(h.device_id, h.name)}>
                <ha-icon icon="mdi:radar"></ha-icon>In Radar-Raum umwandeln
              </button>
            </div>
          </div>` : m}
      <h3>Melder</h3>
      <ul class="list">
        <li class="item">
          <div class="row static">
            <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
            <span class="name">${this.raum?.name}<small>${t ? n ? "jemand da" : "niemand da" : e?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${t ? n ? "on" : "off" : "off unreachable"}" style="--zone:var(--rz-bereich)">${t ? n ? "da" : "leer" : "nicht erreichbar"}</span>
          </div>
        </li>
      </ul>
      ${this.kannAendern ? u`${s ? u`${this.renderNurBereich(this.raum?.bereich_id)}<ul class="melder-liste">
                  ${o.map((l) => {
      const c = this.melder.includes(l.id) || this.melder.includes(l.entity_id);
      return u`<li>
                      <label class="check"
                        ><input
                          type="checkbox"
                          .checked=${c}
                          @change=${(d) => {
        const g = d.target.checked;
        if (this.melder = g ? [...this.melder, l.id] : this.melder.filter((p) => p !== l.id && p !== l.entity_id), !g) {
          const { [l.id]: p, ...f } = this.melderLagen;
          this.melderLagen = f, this.zones = this.zones.map((b) => ({ ...b, melder: (b.melder ?? []).filter(($) => $ !== l.id) }));
        }
        this.dirty = !0;
      }}
                        /><span>${l.name}<small>${this.melderInfo(l)}</small></span></label
                      >
                      ${c ? u`<div class="actions melder-aktionen">
                            ${this.melderLagen[l.id] ? m : u`<button class="text small" @click=${() => this.melderPlatzieren(l.id)}>
                                  <ha-icon icon="mdi:map-marker-plus-outline"></ha-icon>Im Plan platzieren
                                </button>`}
                            ${this.renderMelderErfassung(l.id)}
                            <button
                              class="text small"
                              @click=${() => {
        this.zoneFuerMelder = l.id, this.setTool("rechteck"), this.showToast(`Zone für „${l.name}“: im Plan ein Rechteck aufziehen.`);
      }}
                            >
                              <ha-icon icon="mdi:shape-rectangle-plus"></ha-icon>Zone für diesen Melder
                            </button>
                          </div>` : m}
                    </li>`;
    })}
                </ul>` : u`<p class="hint">Lädt …</p>`}
            <label class="field"
              >Nachlauf<input
                type="number"
                min="0"
                max=${this.data?.grenzen.melder_nachlauf_s ?? 3600}
                .value=${String(this.nachlauf)}
                @change=${(l) => {
      const c = Number(l.target.value);
      Number.isFinite(c) && (this.nachlauf = Math.max(0, Math.min(this.data?.grenzen.melder_nachlauf_s ?? 3600, Math.round(c))), this.dirty = !0);
    }}
              /><span class="unit">s</span></label
            >
            <div class="summary">
              Der Raum gilt als belegt, solange ein Melder „Bewegung“ meldet, und noch ${10 + this.nachlauf} s danach${this.nachlauf ? ` (10 s Haltezeit und ${this.nachlauf} s Nachlauf)` : " (Haltezeit)"}. Sind alle Melder nicht erreichbar, bleibt der letzte Stand.
            </div>` : u`<ul class="doors">
            ${this.melder.map((l) => u`<li class="door"><ha-icon icon="mdi:motion-sensor"></ha-icon><span>${i(l)}</span></li>`)}
          </ul>`}
      ${this.kannAendern ? this.renderRoomEdit() : m}`;
  }
  renderRoomTab() {
    if (this.istMelder) return this.renderMelderTab();
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = e?.letzter_rahmen_vor_s, s = e ? e.figuren.filter((r) => !r.tags.includes("wiederhergestellt") && !r.tags.includes("stoerung")).length : 0, i = (r, a, o, h, l) => u`<label class="field"
        >${a}<input
          type="number"
          min=${h}
          max=${l}
          .value=${String(this.sensor[r])}
          @change=${(c) => {
      const d = Number(c.target.value);
      Number.isFinite(d) && (this.remember(), this.sensor = { ...this.sensor, [r]: Math.max(h, Math.min(l, d)) }, this.dirty = !0);
    }}
        /><span class="unit">${o}</span></label
      >`;
    return u`<h3>Sensor</h3>
      <ul class="list">
        <li class="item ${this.sensorOpen ? "open" : ""}">
          <div class="row" @click=${() => this.sensorOpen = !this.sensorOpen}>
            <span class="marker-icon"><ha-icon icon="mdi:radar"></ha-icon></span>
            <span class="name">Radarsensor<small>${t ? "liefert Daten" : e?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${t ? "on" : "off"}" style="--zone:var(--ok)">${t ? "live" : "nicht erreichbar"}</span>
          </div>
          ${this.sensorOpen ? u`<div class="inspector">
                <dl>
                  <dt>Figuren</dt>
                  <dd>${s}</dd>
                  <dt>Letzte Meldung</dt>
                  <dd>${n == null ? "–" : n < 120 ? `vor ${Math.round(n)} s` : `vor ${Math.round(n / 60)} min`}</dd>
                </dl>
                <p class="hint small">Liegt jemand ruhig, meldet der Sensor oft minutenlang nichts. Das ist normal; Raumzonen hält die Figur.</p>
                ${this.kannAendern ? this.renderSensorEdit(i) : m}
              </div>` : m}
        </li>
      </ul>
      ${this.kannAendern ? u`${this.renderWizard()} ${this.renderRoomEdit()}` : m}`;
  }
  renderWizard() {
    const e = this.wiz;
    if (!e)
      return u`<h3>Sensor umsetzen</h3>
        <p class="hint small">
          Hängt der Sensor an einer neuen Stelle? Der Assistent rechnet aus drei Stellen im Raum aus, wo er jetzt hängt und wohin er schaut.
          Die Zonen bleiben, wo sie sind.
        </p>
        <div class="actions">
          <button class="text small" @click=${() => this.wizStart("umsetzen")}><ha-icon icon="mdi:map-marker-path"></ha-icon>Vor dem Umhängen starten</button>
          <button class="text small" @click=${() => this.wizStart("einmessen")}><ha-icon icon="mdi:crosshairs-gps"></ha-icon>Sensor hängt schon: einmessen</button>
        </div>`;
    const t = e.aktiv + 1, n = e.messung, s = n ? Math.max(0, Math.ceil((n.bis - Date.now()) / 1e3)) : 0, i = (o) => n ? u`<div class="note">Bitte ruhig stehen … noch ${s} s${n.hinweis ? u`<br />${n.hinweis}` : m}</div>` : u`<div class="actions"><span class="spacer"></span><button class="primary" ?disabled=${this.dirty} @click=${this.wizMessen}><ha-icon icon="mdi:human-handsdown"></ha-icon>${o}</button></div>`, r = u`<ol class="wiz-stellen">
      ${[0, 1, 2].map((o) => {
      const h = e.schritt === "vorher" ? !!e.raum[o] : e.modus === "umsetzen" ? !!e.sensor[o] : !!e.sensor[o] && !!e.raum[o];
      return u`<li class=${h ? "fertig" : o === e.aktiv ? "aktiv" : ""}>Stelle ${o + 1}${h ? " ✓" : ""}</li>`;
    })}
    </ol>`;
    let a;
    if (e.schritt === "vorher")
      a = u`<p class="hint small">
          Allein im Raum: Stell dich auf Stelle ${t} und tippe auf „Merken“. Die drei Stellen sollen mindestens 1 m auseinander liegen und
          ein Dreieck bilden, z. B. Bettkante, Tür, Fenster. Merk sie dir gut (im Plan als ${t} markiert).
        </p>
        ${r} ${i(`Stelle ${t} merken`)}`;
    else if (e.schritt === "umhaengen")
      a = u`<p class="hint small">Alle drei Stellen sind gemerkt. Jetzt den Sensor umhängen und neu ausrichten. Danach hier weiter.</p>
        <div class="actions"><span class="spacer"></span><button class="primary" @click=${() => this.wiz = { ...e, schritt: "nachher", aktiv: 0 }}>Sensor hängt neu</button></div>`;
    else if (e.schritt === "nachher")
      a = e.modus === "einmessen" && e.tippen ? u`<p class="note">Jetzt im Plan antippen, wo du bei Stelle ${t} gestanden bist.</p>
            ${r}` : u`<p class="hint small">
              ${e.modus === "umsetzen" ? u`Stell dich wieder auf Stelle ${t} (im Plan markiert) und tippe auf „Messen“.` : u`Allein im Raum: Stell dich an eine Stelle, die du im Plan gut findest (z. B. Bettecke, Türmitte), und tippe auf „Messen“.
                    Danach tippst du sie im Plan an. Drei Stellen, mindestens 1 m auseinander, nicht auf einer Linie.`}
            </p>
            ${r} ${i(`Stelle ${t} messen`)}`;
    else {
      const o = e.ergebnis, h = o.rest_cm <= 15, l = this.raum.sensor, c = Math.round(Math.hypot(o.x - l.x, o.y - l.y));
      let d = Math.round(((o.winkel - l.winkel) % 360 + 540) % 360 - 180);
      d === -180 && (d = 180);
      const g = d === 0 ? "gleich ausgerichtet" : `um ${Math.abs(d)}° ${d > 0 ? "nach links" : "nach rechts"} gedreht`;
      a = u`<p class="summary">
          ${e.modus === "umsetzen" || c > 0 ? u`Der Sensor hängt jetzt ${c < 10 ? "fast an derselben Stelle" : `${c} cm von der alten Stelle entfernt`} und ist ${g}.` : m}
          Genauigkeit: etwa ± ${Math.max(1, Math.round(o.rest_cm))} cm.
        </p>
        ${h ? m : u`<p class="note warn">Ungenau. Besser noch einmal messen, ruhig stehen und genau dieselben Stellen treffen.</p>`}
        <p class="hint small">Im Plan zeigt der grüne Punkt die neue Lage. Die Zonen bleiben, wo sie im Raum sind.</p>
        <div class="actions">
          <button class="text small" @click=${() => this.wizStart(e.modus)}>Noch einmal</button>
          <span class="spacer"></span>
          <button class="primary" @click=${this.wizUebernehmen}><ha-icon icon="mdi:check"></ha-icon>Übernehmen</button>
        </div>`;
    }
    return u`<div class="neu-raum">
      <h3>${e.modus === "umsetzen" ? "Sensor umsetzen" : "Sensor einmessen"}</h3>
      ${this.dirty && e.schritt !== "ergebnis" ? u`<p class="note warn">Erst speichern oder verwerfen, dann messen.</p>` : m}
      ${e.fehler ? u`<p class="note warn">${e.fehler}</p>` : m} ${a}
      <div class="actions">
        <button class="text small" @click=${this.wizEnde}>Abbrechen</button>
      </div>
    </div>`;
  }
  renderSensorEdit(e) {
    return u`<label class="check"
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
    return u`${this.istMelder ? m : u`<p class="hint small">
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
        ${this.umriss.length >= 3 ? u`<button class="text small" @click=${() => this.setTool("oeffnung")}><ha-icon icon="mdi:door"></ha-icon>Tür / Öffnung</button>` : m}
        ${this.umriss.length ? u`<button
              class="text small danger"
              @click=${() => {
      this.remember(), this.umriss = [], this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
    }}
            >
              Entfernen
            </button>` : m}
      </div>
      ${this.oeffnungen.length ? u`<ul class="list">
            ${this.oeffnungen.map(
      (e, t) => u`<li class="item ${t === this.selOpening ? "open" : ""}">
                <div class="row" @click=${() => this.selOpening = t === this.selOpening ? -1 : t}>
                  <ha-icon icon=${e.art === "tuer" ? "mdi:door" : "mdi:door-open"}></ha-icon>
                  <span class="name">${Se(e, t)}<small>${e.art === "tuer" ? "Tür" : "Offen"} · ${Math.round(e.bis - e.von)} cm breit${e.fuehrt_zu ? ` · zu ${this.tuerZielText(e.gegenstueck ? `tuer:${e.gegenstueck}` : e.fuehrt_zu)}` : ""}</small></span>
                </div>
                ${t === this.selOpening ? u`<div class="inspector">
                      <div class="levels">
                        ${["tuer", "offen"].map(
        (n) => u`<button
                            class=${e.art === n ? "active" : ""}
                            @click=${() => {
          this.remember(), this.oeffnungen = this.oeffnungen.map((s, i) => i === t ? { ...s, art: n } : s), this.dirty = !0;
        }}
                          >
                            ${n === "tuer" ? "Tür" : "Offen (ohne Tür)"}
                          </button>`
      )}
                      </div>
                      ${e.art === "tuer" ? u`<div class="actions">
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
                          </div>` : m}
                      <label class="field"
                        >Name<input
                          type="text"
                          maxlength="60"
                          .value=${e.name ?? ""}
                          placeholder=${Se(e, t)}
                          @change=${(n) => this.changeOpening(t, { name: n.target.value.trim() })}
                      /></label>
                      ${this.renderTuerZiel(this.raumId, e.gegenstueck ? `tuer:${e.gegenstueck}` : e.fuehrt_zu ?? "", (n) => {
        const s = n.startsWith("tuer:") ? n.slice(5) : "";
        this.changeOpening(t, { gegenstueck: s, fuehrt_zu: s ? s.split("/")[0] : n });
      })}
                      <p class="hint small">
                        Breite: die Punkte an den Enden ziehen; verschieben: die Öffnung selbst ziehen.${this.istMelder ? "" : " Damit Raumzonen „betreten“ und „verlassen“ genau erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor zeichnen."}
                      </p>
                      <div class="actions">
                        <span class="spacer"></span>
                        <button class="text danger" @click=${() => this.deleteOpening(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
                      </div>
                    </div>` : m}
              </li>`
    )}
          </ul>` : m}
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
      ${this.aufnahme ? u`<label class="field"
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
          >` : m}
      <h3>Raum löschen</h3>
      <div class="actions">
        <button class="text danger" ?disabled=${this.saving} @click=${this.deleteRoom}><ha-icon icon="mdi:delete-outline"></ha-icon>Raum löschen</button>
      </div>`;
  }
  renderHausSide() {
    const e = this.data?.raeume ?? [], t = e.find((i) => i.id === this.hausSel), n = (i, r, a) => u`<button class="text small" @click=${() => this.turnRoom(t.id, i)}><ha-icon icon=${r}></ha-icon>${a}</button>`, s = (i, r) => {
      const a = r.key, o = this.tueren[a] ?? "", h = this.tuerNamen[a] ?? r.name;
      if (!this.kannAendern)
        return u`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${h}: ${this.tuerZielText(o)}</span></li>`;
      const l = o ? null : Be(e, i.id, r.punkt);
      return u`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <div class="door-felder">
          <span class="door-name">${h}</span>
          ${r.oeffnung !== void 0 ? u`<label class="field"
                >Name<input
                  type="text"
                  maxlength="60"
                  .value=${this.tuerNamen[a] ?? i.oeffnungen?.[r.oeffnung]?.name ?? ""}
                  placeholder=${r.name}
                  @input=${(c) => {
        this.tuerNamen = { ...this.tuerNamen, [a]: c.target.value }, this.dirty = !0;
      }}
              /></label>` : m}
          ${this.renderTuerZiel(i.id, o, (c) => {
        this.tueren = { ...this.tueren, [a]: c }, this.dirty = !0;
      })}
          ${l ? u`<div class="actions">
                <button
                  class="text small"
                  @click=${() => {
        this.tueren = { ...this.tueren, [a]: `tuer:${l.tuer.key}` }, this.dirty = !0;
      }}
                >
                  <ha-icon icon="mdi:link-variant"></ha-icon>Nächste Tür: ${this.tuerText(l.tuer)} (${(l.abstand / 100).toFixed(1).replace(".", ",")} m)
                </button>
              </div>` : m}
        </div>
      </li>`;
    };
    return u`<aside class="side">
      <div class="side-body">
        <h3>Hausplan</h3>
        ${this.renderStockwerkWahl()}
        <p class="hint small">
          ${this.kannAendern ? "Räume am Plan an ihren Platz ziehen und hier drehen. Bei jeder Tür eintragen, wohin sie führt; dann sieht Raumzonen, wer von wo nach wo geht." : "So liegen die Räume im Haus. Die Punkte zeigen, wo gerade jemand ist."}
        </p>
        ${this.kannAendern ? u`${this.renderNeuRaum()} ${this.renderPlanImport()}` : m}
        ${this.kannAendern && e.some((i) => N(i).length) ? u`<div class="actions">
              <button class="text small" @click=${() => this.tuerenAutomatisch()}><ha-icon icon="mdi:link-variant"></ha-icon>Türen automatisch verbinden</button>
            </div>` : m}
        <ul class="list">
          ${e.filter((i) => this.aufStockwerk(i)).map((i) => {
      const r = this.hausLive[i.id], a = r ? r.figuren.filter((g) => !g.tags.includes("wiederhergestellt") && !g.tags.includes("stoerung")).length : 0, o = i.id === this.hausSel, h = N(i), l = i.art === "melder", c = l ? !!r?.zonen[q]?.belegt : a > 0, d = !!r && r.verfuegbar && !r.problem;
      return u`<li class="item ${o ? "open" : ""}">
              <div class="row" @click=${() => this.hausSel = o ? "" : i.id}>
                <span class="marker-icon"><ha-icon icon=${l ? "mdi:motion-sensor" : "mdi:radar"}></ha-icon></span>
                <span class="name">${i.name}<small
                  >${l ? "Bewegungsmelder" : "Radarsensor"}${this.data?.stockwerke_ha?.length && !this.stockwerkeVon(i).length ? " · kein Stockwerk" : ""}${i.haus_gesetzt || this.dirty ? "" : " · noch nicht eingeordnet"}</small
                ></span>
                <span class="badge ${d ? c ? "on" : "off" : "off unreachable"}">${d ? l ? c ? "da" : "leer" : a ? `${a}` : "leer" : "nicht erreichbar"}</span>
              </div>
              ${o ? u`<div class="inspector">
                    ${this.kannAendern && t ? u`<div class="label-text">Drehen</div>
                          <div class="actions">
                            ${n(90, "mdi:rotate-left", "90°")} ${n(-90, "mdi:rotate-right", "90°")} ${n(5, "mdi:rotate-left", "5°")}
                            ${n(-5, "mdi:rotate-right", "5°")}
                          </div>` : m}
                    ${this.kannAendern ? this.renderRaumStockwerke(i) : m}
                    ${h.length ? u`<div class="label-text">Türen</div>
                          <ul class="doors">
                            ${h.map((g) => s(i, g))}
                          </ul>` : u`<p class="hint small">Keine Tür eingezeichnet. Im Raum mit dem Werkzeug „Tür oder Öffnung“ in eine Wand zeichnen${l ? "" : " oder eine Zone mit der Rolle „Tür“ anlegen"}.</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(i.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>` : m}
            </li>`;
    })}
        </ul>
        ${this.kannAendern ? u`${this.renderPlanListe()} ${this.renderProfil()} ${this.renderWege()}` : m}
      </div>
    </aside>`;
  }
  /** „Küche · Tür zum Flur“ */
  tuerText(e) {
    return `${this.data?.raeume.find((n) => n.id === e.raumId)?.name ?? e.raumId} · ${this.tuerNamen[e.key] || e.name}`;
  }
  tuerZielText(e) {
    if (!e) return "weiß nicht";
    if (e === "aussen") return "nach draußen";
    if (e.startsWith("tuer:")) {
      const t = e.slice(5), n = (this.data?.raeume ?? []).flatMap((s) => N(s)).find((s) => s.key === t);
      return n ? this.tuerText(n) : "weiß nicht";
    }
    return this.data?.raeume.find((t) => t.id === e)?.name ?? "weiß nicht";
  }
  /** Auswahl „führt zu“: draußen, ein Raum oder eine bestimmte Tür darin. */
  renderTuerZiel(e, t, n) {
    const s = (this.data?.raeume ?? []).filter((i) => i.id !== e);
    return u`<label class="field"
      >Führt zu<select @change=${(i) => n(i.target.value)}>
        <option value="" ?selected=${!t}>weiß nicht</option>
        <option value="aussen" ?selected=${t === "aussen"}>draußen / Raum ohne Raumzonen</option>
        ${s.map(
      (i) => u`<optgroup label=${i.name}>
            <option value=${i.id} ?selected=${t === i.id}>${i.name} (irgendeine Tür)</option>
            ${N(i).map((r) => u`<option value=${`tuer:${r.key}`} ?selected=${t === `tuer:${r.key}`}>${i.name} · ${this.tuerNamen[r.key] || r.name}</option>`)}
          </optgroup>`
    )}
      </select></label
    >`;
  }
  /** Alle Türen ohne Ziel mit der nächsten Tür verbinden (höchstens 1,5 m). */
  tuerenAutomatisch() {
    const e = this.data?.raeume ?? [], t = { ...this.tueren };
    let n = 0;
    for (const s of e)
      for (const i of N(s)) {
        const r = (o, h) => !t[o] || !t[o].startsWith("tuer:") && t[o] !== "aussen" && (!h || t[o] === h);
        if (!r(i.key)) continue;
        const a = Be(e, s.id, i.punkt);
        !a || !r(a.tuer.key, s.id) || t[i.key] && t[i.key] !== a.tuer.raumId || (t[i.key] = `tuer:${a.tuer.key}`, t[a.tuer.key] = `tuer:${i.key}`, n++);
      }
    this.tueren = t, n && (this.dirty = !0), this.showToast(n ? `${n} ${n === 1 ? "Verbindung" : "Verbindungen"} vorgeschlagen. Prüfen und oben „Speichern“.` : "Keine Tür ohne Ziel mit einer Tür in der Nähe gefunden.");
  }
  renderPlanListe() {
    const e = this.data?.plaene ?? [];
    return e.length ? u`<h3>Grundrisse</h3>
      <ul class="list">
        ${e.map(
      (t) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><ha-icon icon="mdi:image-outline"></ha-icon></span>
              <span class="name"
                >${t.name}<small
                  >${this.planBilder[t.id] ? this.planLage(t).stockwerk ? `nur im Stockwerk „${this.data?.stockwerke_ha?.find((n) => n.id === this.planLage(t).stockwerk)?.name ?? this.planLage(t).stockwerk}“` : "auf jedem Stockwerk" : "Bild fehlt"}</small
                ></span
              >
              <button
                class="text small"
                @click=${() => {
        this.planEdit = this.planEdit === t.id ? "" : t.id, this.planMessen = null, this.planEdit && (this.zeigePlan = !0, this.showToast("Bild ziehen zum Verschieben, Ecken ziehen zum Zuschneiden."));
      }}
              >
                <ha-icon icon="mdi:crop-rotate"></ha-icon>${this.planEdit === t.id ? "Fertig" : "Ausrichten"}
              </button>
            </div>
            ${this.planEdit === t.id ? u`<div class="inspector">
                  ${this.data?.stockwerke_ha?.length ? u`<label class="field"
                        >Stockwerk<select
                          @change=${(n) => {
        const s = n.target.value;
        this.planAendern(t, { stockwerk: s }), s && (this.stockwerk = s);
      }}
                        >
                          <option value="" ?selected=${!this.planLage(t).stockwerk}>jedes Stockwerk</option>
                          ${this.data.stockwerke_ha.map((n) => u`<option value=${n.id} ?selected=${this.planLage(t).stockwerk === n.id}>${n.name}</option>`)}
                        </select></label
                      >` : m}
                  <div class="label-text">Drehen</div>
                  <div class="actions">
                    ${[
        [90, "mdi:rotate-left", "90°"],
        [-90, "mdi:rotate-right", "90°"],
        [5, "mdi:rotate-left", "5°"],
        [-5, "mdi:rotate-right", "5°"],
        [1, "mdi:rotate-left", "1°"],
        [-1, "mdi:rotate-right", "1°"]
      ].map(([n, s, i]) => u`<button class="text small" @click=${() => this.planDrehen(t, n)}><ha-icon icon=${s}></ha-icon>${i}</button>`)}
                  </div>
                  <div class="label-text">Größe</div>
                  <div class="actions">
                    ${[
        [1 / 1.1, "mdi:magnify-minus-outline", "10 %"],
        [1 / 1.01, "mdi:magnify-minus-outline", "1 %"],
        [1.01, "mdi:magnify-plus-outline", "1 %"],
        [1.1, "mdi:magnify-plus-outline", "10 %"]
      ].map(([n, s, i]) => u`<button class="text small" @click=${() => this.planSkalieren(t, n)}><ha-icon icon=${s}></ha-icon>${i}</button>`)}
                  </div>
                  ${this.planMessen ? u`<div class="mass">
                          <span>${this.planMessen.punkte.length < 2 ? `Ins Bild tippen: ${2 - this.planMessen.punkte.length} Punkt${this.planMessen.punkte.length ? "" : "e"} noch` : "Diese Strecke ist"}</span>
                          <label class="field"
                            ><input
                              type="number"
                              min="0.2"
                              max="100"
                              step="0.01"
                              ?disabled=${this.planMessen.punkte.length < 2}
                              placeholder="z. B. 4,20"
                              @change=${(n) => this.planMessen = { ...this.planMessen, meter: Number(n.target.value.replace(",", ".")) || 0 }}
                            /><span class="unit">m</span></label
                          >
                        </div>
                        <div class="actions">
                          <button class="text small" @click=${() => this.planMessen = null}>Abbrechen</button>
                          <span class="spacer"></span>
                          <button
                            class="text small"
                            ?disabled=${this.planMessen.punkte.length < 2 || !(this.planMessen.meter > 0)}
                            @click=${() => {
        const [n, s] = this.planMessen.punkte, i = Math.hypot(s[0] - n[0], s[1] - n[1]);
        i > 0 && this.planSkalieren(t, this.planMessen.meter * 100 / i, n), this.planMessen = null, this.showToast("Maßstab gesetzt. Bild jetzt wieder unter die Räume ziehen.");
      }}
                          >
                            <ha-icon icon="mdi:check"></ha-icon>Maß übernehmen
                          </button>
                        </div>` : u`<div class="actions">
                        <button class="text small" @click=${() => this.planMessen = { punkte: [], meter: 0 }}>
                          <ha-icon icon="mdi:ruler"></ha-icon>Maß neu setzen
                        </button>
                      </div>`}
                  <p class="hint small">Das Bild ziehen, bis es unter den Räumen liegt. Die runden Ecken ziehen, um wegzuschneiden, was nicht dazugehört. Danach oben „Speichern“.</p>
                  <div class="actions">
                    <button class="text small" ?disabled=${!this.planLage(t).zuschnitt.length} @click=${() => this.planAendern(t, { zuschnitt: [] })}>
                      <ha-icon icon="mdi:crop-free"></ha-icon>Zuschnitt zurücksetzen
                    </button>
                    <span class="spacer"></span>
                    <button class="text small danger" ?disabled=${this.saving} @click=${() => this.planLoeschen(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
                  </div>
                </div>` : m}
          </li>`
    )}
      </ul>` : m;
  }
  async planLoeschen(e) {
    if (!(!this._hass || !confirm(`Grundriss „${e.name}“ löschen? Wände und Türen der Räume bleiben, nur das Bild im Hintergrund verschwindet.`))) {
      this.saving = !0;
      try {
        await this._hass.callWS({ type: `${R}/plan/delete`, plan_id: e.id });
        const t = this.planBilder[e.id];
        t && URL.revokeObjectURL(t);
        const { [e.id]: n, ...s } = this.planBilder;
        this.planBilder = s, this.showToast("Grundriss gelöscht."), await new Promise((i) => window.setTimeout(i, 1500)), await this.load();
      } catch (t) {
        this.showToast(`Nicht gelöscht: ${E(t)}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  renderPlanImport() {
    const e = this.plan, t = this.planAuswahl;
    if (!e && t)
      return u`<div class="plan-auswahl">
        <div class="label-text">Im PDF sind ${t.bilder.length} Grundrisse. Welchen übernehmen?</div>
        <div class="plan-bilder">
          ${t.bilder.map(
        (p, f) => u`<button class="plan-bild-wahl" @click=${() => void this.planAuswaehlen(f)}>
              <img src=${p.url} alt="Grundriss ${f + 1}" /><span>Grundriss ${f + 1}</span>
            </button>`
      )}
        </div>
        <p class="hint small">Den anderen danach genauso übernehmen (zum Beispiel für das zweite Stockwerk).</p>
        <div class="actions"><button class="text small" @click=${() => this.planAuswahlZu()}>Abbrechen</button></div>
      </div>`;
    if (!e)
      return u`<div class="actions">
        <label class="text small file-knopf">
          <ha-icon icon="mdi:file-image-outline"></ha-icon>${this.planLaedt ? "Liest …" : "Grundriss übernehmen"}
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            ?disabled=${this.planLaedt || this.dirty}
            @change=${(p) => {
        const f = p.target.files?.[0];
        f && this.planLaden(f), p.target.value = "";
      }}
          />
        </label>
      </div>`;
    const n = this.planCmProPx(), s = this.data?.raeume ?? [], i = (p) => {
      if (!n) return "Größe: erst ein Maß eingeben";
      const f = se(e.g.raeume[p].punkte), b = ($) => ($ / 100).toFixed(1).replace(".", ",");
      return `ca. ${b((f.x1 - f.x0) * n)} × ${b((f.y1 - f.y0) * n)} m`;
    }, r = (p) => this.plan = { ...e, ...p }, a = (p) => T({ art: "vieleck", punkte: p }), o = (p) => {
      const f = p.currentTarget.getBoundingClientRect(), b = [(p.clientX - f.left) / f.width * e.g.breite, (p.clientY - f.top) / f.height * e.g.hoehe];
      r({ strecke: e.strecke.length >= 2 ? [b] : [...e.strecke, b] });
    }, h = e.g.breite / 120, l = v`${e.strecke.length === 2 ? v`<line class="plan-strecke" x1=${e.strecke[0][0]} y1=${e.strecke[0][1]} x2=${e.strecke[1][0]} y2=${e.strecke[1][1]} stroke-width=${h / 1.5} />` : m}${e.strecke.map(([p, f]) => v`<circle class="plan-strecke" cx=${p} cy=${f} r=${h} />`)}`, c = v`<svg class="plan-vorschau" viewBox="0 0 ${e.g.breite} ${e.g.hoehe}" @click=${o}>
      <image href=${e.bild} x="0" y="0" width=${e.g.breite} height=${e.g.hoehe} opacity="0.55" />
      ${e.g.raeume.map((p, f) => {
      const [b, $] = a(p.punkte), k = !!e.zuordnung[f];
      return v`<polygon class="plan-raum ${k ? "on" : ""}" points=${p.punkte.map((_) => _.join(",")).join(" ")} />
          <circle class="plan-nr" cx=${b} cy=${$} r=${e.g.breite / 40} /><text class="plan-nr" x=${b} y=${$} dy="0.35em" font-size=${e.g.breite / 30}>${f + 1}</text>`;
    })}
      ${e.g.luecken.map((p, f) => {
      const b = e.g.raeume[p.raum].punkte, $ = b[p.kante], k = b[(p.kante + 1) % b.length], _ = Math.hypot(k[0] - $[0], k[1] - $[1]) || 1, w = (I) => [$[0] + (k[0] - $[0]) * I / _, $[1] + (k[1] - $[1]) * I / _], [M, A] = w(p.von_px), [S, L] = w(p.bis_px);
      return v`<line class="plan-luecke ${e.art[f]}" x1=${M} y1=${A} x2=${S} y2=${L} stroke-width=${e.g.breite / 150} />`;
    })}
      ${l}
    </svg>`, d = e.zuordnung.filter(Boolean), g = d.length !== new Set(d).size;
    return u`<div class="neu-raum">
      <h3>Grundriss übernehmen</h3>
      <p class="hint small">
        ${e.g.raeume.length ? `${e.g.raeume.length} ${e.g.raeume.length === 1 ? "Raum" : "Räume"} erkannt. Grün sind Türen, grau Fenster. Übernommen werden Wände, Türen, die Lage im Haus und das Bild als Hintergrund (es bleibt in deinem Home Assistant).` : "Keine Räume erkannt (dafür braucht es die blauen Umrisslinien eines Scans). Das Bild lässt sich trotzdem als Hintergrund übernehmen; die Wände zeichnest du dann darüber."}
      </p>
      ${c}
      ${this.stockwerk ? u`<p class="hint small">Gehört zum Stockwerk „${this.data?.stockwerke_ha?.find((p) => p.id === this.stockwerk)?.name ?? this.stockwerk}“ (oben gewählt).</p>` : this.data?.stockwerke_ha?.length ? u`<p class="note">Tipp: oben erst das Stockwerk wählen, dann gehört der Grundriss dazu.</p>` : m}
      <div class="label-text">Maßstab: zweimal ins Bild tippen (Anfang und Ende einer bekannten Strecke), dann ihre Länge</div>
      <div class="mass">
        <span>${e.strecke.length === 2 ? "Strecke ist" : `${e.strecke.length} von 2 Punkten`}</span>
        <label class="field"
          ><input
            type="number"
            min="0.2"
            max="100"
            step="0.01"
            ?disabled=${e.strecke.length !== 2}
            .value=${e.streckeM ? String(e.streckeM) : ""}
            placeholder="z. B. 4,20"
            @change=${(p) => r({ streckeM: Number(p.target.value.replace(",", ".")) || 0 })}
          /><span class="unit">m</span></label
        >
      </div>
      ${e.g.raeume.length ? u`<div class="label-text">oder über einen erkannten Raum</div>` : m}
      <div class="mass" style=${e.g.raeume.length ? "" : "display:none"}>
        <select @change=${(p) => r({ massRaum: Number(p.target.value) })}>
          ${e.g.raeume.map((p, f) => u`<option value=${f} ?selected=${e.massRaum === f}>Raum ${f + 1}</option>`)}
        </select>
        <span>ist innen</span>
        <select @change=${(p) => r({ massSeite: p.target.value })}>
          <option value="breite" ?selected=${e.massSeite === "breite"}>von links nach rechts</option>
          <option value="tiefe" ?selected=${e.massSeite === "tiefe"}>von oben nach unten</option>
        </select>
        <label class="field"
          ><input
            type="number"
            min="0.5"
            max="50"
            step="0.01"
            .value=${e.massM ? String(e.massM) : ""}
            placeholder="z. B. 4,20"
            @change=${(p) => r({ massM: Number(p.target.value.replace(",", ".")) || 0 })}
          /><span class="unit">m</span></label
        >
      </div>
      <ul class="list">
        ${e.g.raeume.map(
      (p, f) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><b>${f + 1}</b></span>
              <span class="name">Raum ${f + 1}<small>${i(f)}</small></span>
              <select
                @change=${(b) => {
        const $ = [...e.zuordnung];
        $[f] = b.target.value, r({ zuordnung: $ });
      }}
              >
                <option value="" ?selected=${!e.zuordnung[f]}>nicht übernehmen</option>
                ${s.map((b) => u`<option value=${b.id} ?selected=${e.zuordnung[f] === b.id}>${b.name}</option>`)}
              </select>
            </div>
            ${e.g.luecken.map((b, $) => ({ l: b, li: $ })).filter(({ l: b }) => b.raum === f).map(
        ({ l: b, li: $ }) => u`<div class="row static luecke">
                  <ha-icon icon="mdi:door"></ha-icon>
                  <span class="name"
                    >${n ? `${((b.bis_px - b.von_px) * n / 100).toFixed(2).replace(".", ",")} m breit` : "Lücke"}<small
                      >${b.partner !== null ? `zu Raum ${b.partner + 1}` : "Außenwand"}</small
                    ></span
                  >
                  <select @change=${(k) => r({ art: { ...e.art, [$]: k.target.value } })}>
                    <option value="tuer" ?selected=${e.art[$] === "tuer"}>Tür</option>
                    <option value="offen" ?selected=${e.art[$] === "offen"}>offen</option>
                    <option value="fenster" ?selected=${e.art[$] === "fenster"}>Fenster (weglassen)</option>
                  </select>
                </div>`
      )}
          </li>`
    )}
      </ul>
      ${s.some((p) => e.zuordnung.includes(p.id) && p.art !== "melder") ? u`<p class="note">Bei Räumen mit Radarsensor danach den Sensor einmessen (Sensor und Raum → Sensor umsetzen), damit er zu den neuen Wänden passt.</p>` : m}
      ${g ? u`<p class="note warn">Jeder Raum nur einmal zuordnen.</p>` : m}
      ${s.length ? m : u`<p class="hint small">Zuerst Räume anlegen (Raum hinzufügen), dann hier zuordnen.</p>`}
      <div class="actions">
        <button class="text small" @click=${this.planZu}>Abbrechen</button>
        <span class="spacer"></span>
        <button class="primary" ?disabled=${!n || g || this.saving} @click=${this.planUebernehmen}>
          <ha-icon icon="mdi:check"></ha-icon>${d.length ? "Übernehmen" : "Als Hintergrund übernehmen"}
        </button>
      </div>
    </div>`;
  }
  renderStockwerkWahl() {
    const e = this.data?.stockwerke_ha ?? [];
    if (!e.length) return m;
    const t = (n, s, i) => u`<button
        class=${this.stockwerk === n ? "active" : ""}
        @click=${() => {
      this.stockwerk = n, this.hausSel = "", this.viewTouched = !1, this.fit();
    }}
      >
        ${i ? u`<ha-icon icon=${i}></ha-icon>` : m}${s}
      </button>`;
    return u`<div class="levels stockwerke" role="group" aria-label="Stockwerk">
      ${t("", "Alle", "mdi:home-outline")} ${e.map((n) => t(n.id, n.name, n.icon))}
    </div>`;
  }
  /** Im Hausplan: auf welchen Stockwerken liegt der Raum, zu welchem Bereich gehört er? */
  renderRaumStockwerke(e) {
    const t = this.data?.stockwerke_ha ?? [], n = this.data?.bereiche_ha ?? [];
    if (!t.length && !n.length) return m;
    const s = this.hausExtra[e.id] ?? {}, i = s.stockwerke ?? e.stockwerke ?? [], r = this.stockwerkeVon(e), a = s.bereich_id ?? e.bereich_id ?? "", o = (h) => {
      this.hausExtra = { ...this.hausExtra, [e.id]: { ...s, ...h } }, this.dirty = !0;
    };
    return u`<div class="label-text">Bereich in Home Assistant</div>
      <label class="field"
        ><select @change=${(h) => o({ bereich_id: h.target.value })}>
          <option value="" ?selected=${!a}>keiner</option>
          ${n.map((h) => u`<option value=${h.id} ?selected=${h.id === a}>${h.name}</option>`)}
        </select></label
      >
      ${t.length ? u`<div class="label-text">Stockwerke${i.length ? "" : " (vom Bereich)"}</div>
            <div class="stockwerk-wahl">
              ${t.map(
      (h) => u`<label class="check"
                  ><input
                    type="checkbox"
                    .checked=${r.includes(h.id)}
                    @change=${(l) => {
        const c = l.target.checked, d = i.length ? i : r;
        o({ stockwerke: c ? [...d.filter((g) => g !== h.id), h.id] : d.filter((g) => g !== h.id) });
      }}
                  /><span>${h.name}</span></label
                >`
    )}
            </div>
            <p class="hint small">Eine Treppe liegt auf zwei Stockwerken; sie erscheint dann in beiden Plänen an derselben Stelle.</p>` : m}`;
  }
  /** Melder nach Gerät gruppieren (ein FP2 liefert z. B. einen Melder je Zone). */
  melderGruppen(e) {
    const t = /* @__PURE__ */ new Map();
    for (const n of e) {
      const s = n.geraet ?? "ohne Gerät";
      t.set(s, [...t.get(s) ?? [], n]);
    }
    return [...t.entries()];
  }
  renderNeuRaum() {
    const e = this.kandidaten, t = this.neuRaum;
    if (!t)
      return u`<div class="actions">
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
      const h = t.melder.includes(o.id);
      return u`<li>
        <label class="check"
          ><input
            type="checkbox"
            .checked=${h}
            ?disabled=${!!o.benutzt_von && !h}
            @change=${(l) => {
        const c = l.target.checked, d = c ? [...t.melder, o.id] : t.melder.filter((g) => g !== o.id);
        n({ melder: d, bereich_id: t.bereich_id || (c ? o.bereich_id ?? "" : t.bereich_id) });
      }}
          /><span
            >${o.name}<small
              >${this.melderInfo(o)}${o.benutzt_von ? ` · schon in „${this.data?.raeume.find((l) => l.id === o.benutzt_von)?.name ?? o.benutzt_von}“` : ""}</small
            ></span
          ></label
        >
      </li>`;
    };
    return u`<div class="neu-raum">
      <h3>Raum hinzufügen</h3>
      ${e ? u`${s.length ? u`<div class="label-text">Aus Home Assistant übernehmen</div>
                  <ul class="list">
                    ${s.map(
      (o) => u`<li class="item">
                        <div class="row static">
                          <span class="marker-icon"><ha-icon icon=${o.art === "radar" ? "mdi:radar" : "mdi:motion-sensor"}></ha-icon></span>
                          <span class="name"
                            >${o.name}<small
                              >${o.art === "radar" ? `Radarsensor ${e.fp400.find((h) => h.device_id === o.device_id)?.name ?? ""}` : `${o.melder.length} Melder in diesem Bereich`}</small
                            ></span
                          >
                          <button
                            class="text small"
                            ?disabled=${this.saving}
                            @click=${() => this.createRoom(
        o.art === "radar" ? { name: o.name, art: "radar", device_id: o.device_id, bereich_id: o.bereich_id } : { name: o.name, art: "melder", melder: o.melder, bereich_id: o.bereich_id }
      )}
                          >
                            Übernehmen
                          </button>
                        </div>
                      </li>`
    )}
                  </ul>` : m}
            <div class="label-text">Selbst anlegen</div>
            <label class="field">Name<input type="text" .value=${t.name} maxlength="60" @input=${(o) => n({ name: o.target.value })} /></label>
            <div class="levels" role="group" aria-label="Art des Raums">
              <button class=${t.art === "melder" ? "active" : ""} @click=${() => n({ art: "melder" })}><ha-icon icon="mdi:motion-sensor"></ha-icon>Bewegungsmelder</button>
              <button class=${t.art === "radar" ? "active" : ""} @click=${() => n({ art: "radar" })}><ha-icon icon="mdi:radar"></ha-icon>Radarsensor FP400</button>
            </div>
            <label class="field"
              >Bereich in Home Assistant<select @change=${(o) => n({ bereich_id: o.target.value })}>
                <option value="" ?selected=${!t.bereich_id}>keiner</option>
                ${e.bereiche.map((o) => u`<option value=${o.bereich_id} ?selected=${t.bereich_id === o.bereich_id}>${o.name}</option>`)}
              </select></label
            >
            ${t.art === "melder" ? e.melder.length ? u`${this.renderNurBereich(t.bereich_id)}<ul class="melder-liste">
                    ${this.melderGruppen(this.melderAuswahl(e.melder, t.bereich_id, t.melder)).map(
      ([o, h]) => u`<li class="gruppe">${o}</li>
                        ${h.map(a)}`
    )}
                  </ul>` : u`<p class="hint small">Keine Bewegungs- oder Präsenzmelder in Home Assistant gefunden.</p>` : i.length ? u`<label class="field"
                    >Gerät<select @change=${(o) => n({ device_id: o.target.value })}>
                      <option value="" ?selected=${!t.device_id}>bitte wählen</option>
                      ${i.map((o) => u`<option value=${o.device_id} ?selected=${t.device_id === o.device_id}>${o.name}</option>`)}
                    </select></label
                  >` : u`<p class="hint small">Kein freier FP400 gefunden (alle sind schon einem Raum zugeordnet).</p>`}
            ${this.dirty ? u`<p class="note warn">Erst den Hausplan speichern oder verwerfen.</p>` : m}` : u`<p class="hint">Lädt …</p>`}
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
      return u`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
        <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
        ${r.map(([o, h]) => v`<rect x=${((o - e.von) / a * 1e3).toFixed(1)} y="0" width=${Math.max(3, (h - o) / a * 1e3).toFixed(1)} height="10" fill="var(--rz-bereich)" />`)}
      </svg>`;
    }, i = e ? Vn(e.raeume).slice(-12).reverse() : [];
    return u`<h3>Bewegungsprofil</h3>
      <div class="label-text">Wann war wo jemand? Die letzten</div>
      <div class="levels" role="group" aria-label="Zeitraum">
        <button class=${this.profilStunden === 0 ? "active" : ""} @click=${() => this.loadProfil(0)}>aus</button>
        ${At.map((r) => u`<button class=${this.profilStunden === r ? "active" : ""} @click=${() => this.loadProfil(r)}>${r} h</button>`)}
      </div>
      ${this.profilLaedt ? u`<p class="hint">Rechnet …</p>` : e ? u`<ul class="list ausw">
                ${t.map((r) => {
      const a = e.raeume[r.id];
      return u`<li class="item" style="--zone:var(--rz-bereich)">
                    <div class="row static">
                      <span class="name">${r.name}<small>${a ? a.length ? `${a.length}-mal` : "niemand" : "keine Aufnahme"}</small></span>
                      <span class="dauer">${a?.length ? ue(Un(a)) : ""}</span>
                    </div>
                    ${a ? s(a) : m}
                  </li>`;
    })}
              </ul>
              <div class="achse"><span>${this.uhr(e.von)}</span><span>${this.uhr(e.bis)}</span></div>
              ${i.length ? u`<div class="label-text">Letzte Wechsel zwischen Räumen</div>
                    <ul class="doors">
                      ${i.map((r) => u`<li class="door"><ha-icon icon="mdi:arrow-right"></ha-icon><span>${this.uhr(r.zeit)} ${n(r.von)} → ${n(r.nach)}</span></li>`)}
                    </ul>` : m}
              <p class="hint small">
                Ein Wechsel heißt: In einem Raum endet die Bewegung, im anderen beginnt sie kurz danach. Welche Person es war, weiß Raumzonen noch nicht;
                das ist der nächste Schritt.
              </p>` : m}`;
  }
  uhr(e) {
    return new Date(e * 1e3).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  }
  /** Zeitleiste: wann im gewählten Zeitraum jemand da war. */
  renderLeiste(e, t) {
    const n = this.ausw, s = Math.max(1, n.bis - n.von);
    return u`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
      <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
      ${e.map(([i, r]) => {
      const a = (i - n.von) / s * 1e3, o = Math.max(3, (r - i) / s * 1e3);
      return v`<rect x=${a.toFixed(1)} y="0" width=${o.toFixed(1)} height="10" fill=${t} />`;
    })}
    </svg>`;
  }
  figurName(e) {
    return e.figur === "kurz" ? "Kurze Spuren" : `${e.hund ? "Hund?" : "Figur"} ${e.nummer}`;
  }
  renderAuswertungTab() {
    const e = this.ausw, t = (o) => o === q && this.istMelder ? "Jemand da" : this.zones.find((h) => h.id === o)?.name ?? o, n = (o) => {
      const h = this.zones.find((l) => l.id === o);
      return h ? de(he(h)) : o === q ? "var(--rz-bereich)" : "var(--muted)";
    }, s = u`<div class="levels" role="group" aria-label="Zeitraum">
      ${At.map(
      (o) => u`<button
          class=${this.auswStunden === o ? "active" : ""}
          @click=${() => {
        this.auswStunden = o, this.loadAuswertung();
      }}
        >
          ${o} h
        </button>`
    )}
    </div>`, i = u`<h3>Wer war wann wo?</h3>
      <div class="label-text">Die letzten</div>
      ${s}`;
    if (this.auswFehler === "off")
      return u`${i}<p class="note">Die Aufnahme ist für diesen Raum aus. Einschalten unter <b>Sensor und Raum → Aufnahme</b>; ausgewertet wird ab dann.</p>`;
    if (this.auswFehler) return u`${i}<p class="note warn">${this.auswFehler}</p>`;
    if (!e) return u`${i}<p class="hint">${this.auswLaedt ? "Rechnet …" : "Noch keine Daten."}</p>`;
    const r = e.zonen.filter((o) => o.sekunden > 0).sort((o, h) => h.belegt_s - o.belegt_s), a = u`<div class="achse"><span>${this.uhr(e.von)}</span><span>${this.uhr(e.bis)}</span></div>`;
    return u`${i}
      <p class="hint small">${this.auswLaedt ? "Rechnet …" : `${this.uhr(e.von)} bis ${this.uhr(e.bis)}. Die Karte zeigt, wo jemand war: je dunkler, desto länger. Bei den Zonen steht, wie lange dort jemand war.`}</p>
      <h3>Zonen</h3>
      ${r.length ? u`<ul class="list ausw">
            ${r.map(
      (o) => u`<li class="item" style="--zone:${n(o.zone_id)}">
                <div class="row static">
                  <span class="dot"></span>
                  <span class="name">${t(o.zone_id)}<small
                    >${o.figuren.length ? o.figuren.slice(0, 4).map((h) => this.figurName(e.figuren.find((l) => l.figur === h))).join(", ") + (o.figuren.length > 4 ? ` und ${o.figuren.length - 4} weitere` : "") : "nur kurz"}</small
                  ></span>
                  <span class="dauer" title=${o.sekunden > o.belegt_s + 60 ? `Alle Figuren zusammen: ${ue(o.sekunden)}` : ""}>${ue(o.belegt_s)}</span>
                </div>
                ${this.renderLeiste(o.abschnitte, "var(--zone)")}
              </li>`
    )}
          </ul>
          ${a}` : u`<p class="hint">In diesem Zeitraum war niemand in einer Zone.</p>`}
      ${this.istMelder ? u`<p class="hint small">Melder kennen keine Position; darum gibt es hier keine Karte und keine Figuren.</p>` : u`${this.renderVorschlaege(e)} ${this.renderFiguren(e, t, a)}`}`;
  }
  /** Wo sich jemand lange aufhielt und noch keine Zone ist: als Zone vorschlagen. */
  renderVorschlaege(e) {
    if (!this.kannAendern) return m;
    const t = zt(_t(e.figuren.filter((i) => !i.hund).map((i) => i.zellen)), e.zelle_cm, 8);
    if (!t) return m;
    const n = Wn(t, 600).filter((i) => !this.zones.some((r) => He(i.mitte, r.form))).slice(0, 4);
    if (!n.length) return m;
    const s = (i) => (i / 100).toFixed(1).replace(".", ",");
    return u`<h3>Vorschläge für Zonen</h3>
      <p class="hint small">Hier hielt sich jemand lange auf, aber es ist noch keine Zone. Zum Beispiel ein Liegeplatz, das Sofa oder ein Schreibtisch.</p>
      <ul class="list">
        ${n.map(
      (i, r) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><ha-icon icon="mdi:selection-marker"></ha-icon></span>
              <span class="name">Platz ${r + 1}<small>ca. ${s(i.breite)} × ${s(i.tiefe)} m · ${ue(i.sekunden)}</small></span>
              <button
                class="text small"
                @click=${() => {
        this.addZone({ art: "rechteck", mitte: i.mitte, breite: i.breite, tiefe: i.tiefe, winkel: 0 }), this.openTab("zonen"), this.showToast("Zone angelegt. Rolle wählen, Form anpassen und speichern.");
      }}
              >
                Als Zone anlegen
              </button>
            </div>
          </li>`
    )}
      </ul>`;
  }
  renderFiguren(e, t, n) {
    return u`<h3>Figuren</h3>
      ${e.figuren.length ? u`<ul class="list ausw">
            ${e.figuren.map((s) => {
      const i = this.auswFigur === s.figur, r = s.hund ? "var(--rz-tier)" : "var(--rz-person)", a = Object.keys(s.zonen).slice(0, 2).map(t).join(", ");
      return u`<li class="item ${i ? "open" : ""}" style="--zone:${r}">
                <div class="row" role="button" aria-pressed=${i ? "true" : "false"} title="Nur diese Figur auf der Karte zeigen" @click=${() => this.auswFigur = i ? "" : s.figur}>
                  <span class="dot"></span>
                  <span class="name">${this.figurName(s)}<small>${this.uhr(s.erst)} bis ${this.uhr(s.zuletzt)}${a ? ` · ${a}` : ""}</small></span>
                  <span class="dauer">${ue(s.sekunden)}</span>
                </div>
                ${this.renderLeiste(s.abschnitte, "var(--zone)")}
              </li>`;
    })}
          </ul>
          ${n}
          <p class="hint small">
            Antippen zeigt nur diese Figur auf der Karte. Eine Figur ist eine Spur vom Auftauchen bis zum Verschwinden. Wer aufsteht und
            später wiederkommt, kann eine neue Nummer bekommen. Welche Person es ist, weiß Raumzonen noch nicht.
          </p>` : u`<p class="hint">Keine Figuren in diesem Zeitraum.</p>`}`;
  }
  renderSide() {
    return this.page === "haus" ? this.renderHausSide() : u`<aside class="side">
      <div class="tabs" role="tablist">
        <button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => this.openTab("zonen")}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>
        <button class=${this.tab === "raum" ? "active" : ""} role="tab" @click=${() => this.openTab("raum")}><ha-icon icon="mdi:floor-plan"></ha-icon>${this.istMelder ? "Melder und Raum" : "Sensor und Raum"}</button>
        ${this.kannAendern ? u`<button class=${this.tab === "auswertung" ? "active" : ""} role="tab" @click=${() => this.openTab("auswertung")}><ha-icon icon="mdi:chart-bubble"></ha-icon>Auswertung</button>` : m}
      </div>
      <div class="side-body">${this.tab === "zonen" ? this.renderZonesTab() : this.tab === "raum" ? this.renderRoomTab() : this.renderAuswertungTab()}</div>
    </aside>`;
  }
  // -- Ganze Seite ------------------------------------------------------------------
  renderHeader() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem;
    return u`<header>
      <button class="icon menu" title="Menü" @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: !0, composed: !0 }))}>
        <ha-icon icon="mdi:menu"></ha-icon>
      </button>
      <span class="title">Raumzonen</span>
      ${this.data?.raeume.length ? u`<nav class="pages">
            <button class=${this.page === "haus" ? "active" : ""} @click=${() => this.openHaus()}><ha-icon icon="mdi:home-outline"></ha-icon>Haus</button>
            ${this.data.raeume.map(
      (n) => u`<button class=${this.page === "raum" && n.id === this.raumId ? "active" : ""} @click=${() => this.selectRoom(n.id)}>${n.name}</button>`
    )}
          </nav>` : m}
      ${this.raum && this.page === "raum" ? u`<span class="live-chip ${t ? "ok" : "down"}" title=${e?.problem ?? ""}><span class="led"></span><span class="text">${t ? "live" : "nicht erreichbar"}</span></span>` : m}
      <span class="spacer"></span>
      ${this.raum && !this.kannAendern ? u`<span class="badge off" title="Ändern dürfen nur Admins">nur ansehen</span>` : m}
      ${this.raum && this.kannAendern ? u`${this.page === "raum" ? u`<button class="icon" title="Rückgängig (Strg+Z)" ?disabled=${!this.history.size} @click=${this.undo}><ha-icon icon="mdi:undo"></ha-icon></button>` : m}
            <button class="text" ?disabled=${!this.dirty || this.saving} @click=${this.discard}><span class="label">Verwerfen</span><ha-icon icon="mdi:close" style=${this.narrow ? "" : "display:none"}></ha-icon></button>
            <button class="primary" ?disabled=${!this.dirty || this.saving} @click=${() => this.page === "haus" ? this.saveHaus() : this.save()}>
              <ha-icon icon="mdi:content-save-outline"></ha-icon><span class="label">${this.saving ? "Speichert …" : "Speichern"}</span>
            </button>` : m}
    </header>`;
  }
  render() {
    return this.data ? this.data.raeume.length ? u`${this.renderHeader()}
      <div class="layout">${this.renderStage()} ${this.renderSide()}</div>
      ${this.toast ? u`<div class="toast" role="status">${this.toast}</div>` : m}` : u`${this.renderHeader()}
        <div class="empty">
          <ha-icon icon="mdi:floor-plan"></ha-icon>
          <p>
            Noch kein Raum. Einen Raum legst du unter <b>Einstellungen → Geräte &amp; Dienste → Raumzonen → Konfigurieren → Raum
            hinzufügen</b> an. Danach erscheint er hier zum Einzeichnen.
          </p>
        </div>` : u`${this.renderHeader()}<div class="empty">${this.error ? u`<ha-icon icon="mdi:alert-circle-outline"></ha-icon><p>${this.error}</p>` : u`<p>Lädt …</p>`}</div>`;
  }
};
x.styles = On;
y([
  Bt({ type: Boolean, reflect: !0 })
], x.prototype, "narrow", 2);
y([
  z()
], x.prototype, "data", 2);
y([
  z()
], x.prototype, "raumId", 2);
y([
  z()
], x.prototype, "zones", 2);
y([
  z()
], x.prototype, "sensor", 2);
y([
  z()
], x.prototype, "umriss", 2);
y([
  z()
], x.prototype, "oeffnungen", 2);
y([
  z()
], x.prototype, "selVertex", 2);
y([
  z()
], x.prototype, "selOpening", 2);
y([
  z()
], x.prototype, "openingDraft", 2);
y([
  z()
], x.prototype, "selected", 2);
y([
  z()
], x.prototype, "sensorOpen", 2);
y([
  z()
], x.prototype, "tab", 2);
y([
  z()
], x.prototype, "tool", 2);
y([
  z()
], x.prototype, "draft", 2);
y([
  z()
], x.prototype, "rectDraft", 2);
y([
  z()
], x.prototype, "hover", 2);
y([
  z()
], x.prototype, "view", 2);
y([
  z()
], x.prototype, "size", 2);
y([
  z()
], x.prototype, "live", 2);
y([
  z()
], x.prototype, "heat", 2);
y([
  z()
], x.prototype, "heatMin", 2);
y([
  z()
], x.prototype, "ausw", 2);
y([
  z()
], x.prototype, "auswStunden", 2);
y([
  z()
], x.prototype, "auswLaedt", 2);
y([
  z()
], x.prototype, "auswFehler", 2);
y([
  z()
], x.prototype, "kandidaten", 2);
y([
  z()
], x.prototype, "wiz", 2);
y([
  z()
], x.prototype, "plan", 2);
y([
  z()
], x.prototype, "planLaedt", 2);
y([
  z()
], x.prototype, "planAuswahl", 2);
y([
  z()
], x.prototype, "planBilder", 2);
y([
  z()
], x.prototype, "planEdit", 2);
y([
  z()
], x.prototype, "planAenderung", 2);
y([
  z()
], x.prototype, "planMessen", 2);
y([
  z()
], x.prototype, "zeigePlan", 2);
y([
  z()
], x.prototype, "masse", 2);
y([
  z()
], x.prototype, "stockwerk", 2);
y([
  z()
], x.prototype, "wieImHaus", 2);
y([
  z()
], x.prototype, "hausExtra", 2);
y([
  z()
], x.prototype, "neuRaum", 2);
y([
  z()
], x.prototype, "profil", 2);
y([
  z()
], x.prototype, "profilStunden", 2);
y([
  z()
], x.prototype, "profilLaedt", 2);
y([
  z()
], x.prototype, "auswFigur", 2);
y([
  z()
], x.prototype, "layersOpen", 2);
y([
  z()
], x.prototype, "layers", 2);
y([
  z()
], x.prototype, "dirty", 2);
y([
  z()
], x.prototype, "zonesFollow", 2);
y([
  z()
], x.prototype, "saving", 2);
y([
  z()
], x.prototype, "error", 2);
y([
  z()
], x.prototype, "toast", 2);
y([
  z()
], x.prototype, "page", 2);
y([
  z()
], x.prototype, "lagen", 2);
y([
  z()
], x.prototype, "tueren", 2);
y([
  z()
], x.prototype, "wege", 2);
y([
  z()
], x.prototype, "tuerNamen", 2);
y([
  z()
], x.prototype, "hausLive", 2);
y([
  z()
], x.prototype, "hausSel", 2);
y([
  z()
], x.prototype, "aufnahme", 2);
y([
  z()
], x.prototype, "melder", 2);
y([
  z()
], x.prototype, "nurBereich", 2);
y([
  z()
], x.prototype, "nachlauf", 2);
y([
  z()
], x.prototype, "melderLagen", 2);
y([
  z()
], x.prototype, "aufnahmeTage", 2);
x = y([
  fn("raumzonen-panel")
], x);
export {
  x as RaumzonenPanel
};
