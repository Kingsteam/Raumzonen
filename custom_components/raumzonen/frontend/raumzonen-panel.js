/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _e = globalThis, qe = _e.ShadowRoot && (_e.ShadyCSS === void 0 || _e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Xe = Symbol(), it = /* @__PURE__ */ new WeakMap();
let Dt = class {
  constructor(t, n, s) {
    if (this._$cssResult$ = !0, s !== Xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (qe && t === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (t = it.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && it.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Xt = (e) => new Dt(typeof e == "string" ? e : e + "", void 0, Xe), Jt = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((s, i, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[r + 1], e[0]);
  return new Dt(n, e, Xe);
}, Yt = (e, t) => {
  if (qe) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const s = document.createElement("style"), i = _e.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, e.appendChild(s);
  }
}, rt = qe ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const s of t.cssRules) n += s.cssText;
  return Xt(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Qt, defineProperty: en, getOwnPropertyDescriptor: tn, getOwnPropertyNames: nn, getOwnPropertySymbols: sn, getPrototypeOf: rn } = Object, Le = globalThis, at = Le.trustedTypes, an = at ? at.emptyScript : "", on = Le.reactiveElementPolyfillSupport, me = (e, t) => e, Re = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? an : null;
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
} }, Je = (e, t) => !Qt(e, t), ot = { attribute: !0, type: String, converter: Re, reflect: !1, useDefault: !1, hasChanged: Je };
Symbol.metadata ??= Symbol("metadata"), Le.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ne = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = ot) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, n);
      i !== void 0 && en(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, n, s) {
    const { get: i, set: r } = tn(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? ot;
  }
  static _$Ei() {
    if (this.hasOwnProperty(me("elementProperties"))) return;
    const t = rn(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(me("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(me("properties"))) {
      const n = this.properties, s = [...nn(n), ...sn(n)];
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
      for (const i of s) n.unshift(rt(i));
    } else t !== void 0 && n.push(rt(t));
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
    return Yt(t, this.constructor.elementStyles), t;
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
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : Re).toAttribute(n, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Re;
      this._$Em = i;
      const o = a.fromAttribute(n, r.type);
      this[i] = o ?? this._$Ej?.get(i) ?? o, this._$Em = null;
    }
  }
  requestUpdate(t, n, s, i = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (r = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? Je)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
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
ne.elementStyles = [], ne.shadowRootOptions = { mode: "open" }, ne[me("elementProperties")] = /* @__PURE__ */ new Map(), ne[me("finalized")] = /* @__PURE__ */ new Map(), on?.({ ReactiveElement: ne }), (Le.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ye = globalThis, lt = (e) => e, Te = Ye.trustedTypes, ht = Te ? Te.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Nt = "$lit$", j = `lit$${Math.random().toFixed(9).slice(2)}$`, Ot = "?" + j, ln = `<${Ot}>`, J = document, be = () => J.createComment(""), $e = (e) => e === null || typeof e != "object" && typeof e != "function", Qe = Array.isArray, hn = (e) => Qe(e) || typeof e?.[Symbol.iterator] == "function", Ie = `[ 	
\f\r]`, le = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ct = /-->/g, ut = />/g, q = RegExp(`>|${Ie}(?:([^\\s"'>=/]+)(${Ie}*=${Ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), dt = /'/g, pt = /"/g, Bt = /^(?:script|style|textarea|title)$/i, Wt = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), u = Wt(1), w = Wt(2), ie = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), mt = /* @__PURE__ */ new WeakMap(), X = J.createTreeWalker(J, 129);
function Ft(e, t) {
  if (!Qe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ht !== void 0 ? ht.createHTML(t) : t;
}
const cn = (e, t) => {
  const n = e.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = le;
  for (let o = 0; o < n; o++) {
    const l = e[o];
    let h, c, d = -1, f = 0;
    for (; f < l.length && (a.lastIndex = f, c = a.exec(l), c !== null); ) f = a.lastIndex, a === le ? c[1] === "!--" ? a = ct : c[1] !== void 0 ? a = ut : c[2] !== void 0 ? (Bt.test(c[2]) && (i = RegExp("</" + c[2], "g")), a = q) : c[3] !== void 0 && (a = q) : a === q ? c[0] === ">" ? (a = i ?? le, d = -1) : c[1] === void 0 ? d = -2 : (d = a.lastIndex - c[2].length, h = c[1], a = c[3] === void 0 ? q : c[3] === '"' ? pt : dt) : a === pt || a === dt ? a = q : a === ct || a === ut ? a = le : (a = q, i = void 0);
    const p = a === q && e[o + 1].startsWith("/>") ? " " : "";
    r += a === le ? l + ln : d >= 0 ? (s.push(h), l.slice(0, d) + Nt + l.slice(d) + j + p) : l + j + (d === -2 ? o : p);
  }
  return [Ft(e, r + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class ke {
  constructor({ strings: t, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const o = t.length - 1, l = this.parts, [h, c] = cn(t, n);
    if (this.el = ke.createElement(h, s), X.currentNode = this.el.content, n === 2 || n === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = X.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(Nt)) {
          const f = c[a++], p = i.getAttribute(d).split(j), g = /([.?@])?(.*)/.exec(f);
          l.push({ type: 1, index: r, name: g[2], strings: p, ctor: g[1] === "." ? dn : g[1] === "?" ? pn : g[1] === "@" ? mn : He }), i.removeAttribute(d);
        } else d.startsWith(j) && (l.push({ type: 6, index: r }), i.removeAttribute(d));
        if (Bt.test(i.tagName)) {
          const d = i.textContent.split(j), f = d.length - 1;
          if (f > 0) {
            i.textContent = Te ? Te.emptyScript : "";
            for (let p = 0; p < f; p++) i.append(d[p], be()), X.nextNode(), l.push({ type: 2, index: ++r });
            i.append(d[f], be());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ot) l.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(j, d + 1)) !== -1; ) l.push({ type: 7, index: r }), d += j.length - 1;
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
  const r = $e(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(e), i._$AT(e, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (t = re(e, i._$AS(e, t.values), i, s)), t;
}
class un {
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
    let r = X.nextNode(), a = 0, o = 0, l = s[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let h;
        l.type === 2 ? h = new we(r, r.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (h = new fn(r, this, t)), this._$AV.push(h), l = s[++o];
      }
      a !== l?.index && (r = X.nextNode(), a++);
    }
    return X.currentNode = J, i;
  }
  p(t) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, n), n += s.strings.length - 2) : s._$AI(t[n])), n++;
  }
}
class we {
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
    t = re(this, t, n), $e(t) ? t === m || t == null || t === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : t !== this._$AH && t !== ie && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : hn(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== m && $e(this._$AH) ? this._$AA.nextSibling.data = t : this.T(J.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = ke.createElement(Ft(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new un(i, this), a = r.u(this.options);
      r.p(n), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let n = mt.get(t.strings);
    return n === void 0 && mt.set(t.strings, n = new ke(t)), n;
  }
  k(t) {
    Qe(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of t) i === n.length ? n.push(s = new we(this.O(be()), this.O(be()), this, this.options)) : s = n[i], s._$AI(r), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t !== this._$AB; ) {
      const s = lt(t).nextSibling;
      lt(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class He {
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
    if (r === void 0) t = re(this, t, n, 0), a = !$e(t) || t !== this._$AH && t !== ie, a && (this._$AH = t);
    else {
      const o = t;
      let l, h;
      for (t = r[0], l = 0; l < r.length - 1; l++) h = re(this, o[s + l], n, l), h === ie && (h = this._$AH[l]), a ||= !$e(h) || h !== this._$AH[l], h === m ? t = m : t !== m && (t += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class dn extends He {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === m ? void 0 : t;
  }
}
class pn extends He {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== m);
  }
}
class mn extends He {
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
class fn {
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
const gn = Ye.litHtmlPolyfillSupport;
gn?.(ke, we), (Ye.litHtmlVersions ??= []).push("3.3.3");
const bn = (e, t, n) => {
  const s = n?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new we(t.insertBefore(be(), r), r, void 0, n ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = globalThis;
class fe extends ne {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = bn(n, this.renderRoot, this.renderOptions);
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
fe._$litElement$ = !0, fe.finalized = !0, et.litElementHydrateSupport?.({ LitElement: fe });
const $n = et.litElementPolyfillSupport;
$n?.({ LitElement: fe });
(et.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kn = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wn = { attribute: !0, type: String, converter: Re, reflect: !1, hasChanged: Je }, vn = (e = wn, t, n) => {
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
function jt(e) {
  return (t, n) => typeof n == "object" ? vn(e, t, n) : ((s, i, r) => {
    const a = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), a ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(e, t, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function y(e) {
  return jt({ ...e, state: !0, attribute: !1 });
}
const xn = 25;
function Ct(e) {
  return e * Math.PI / 180;
}
function P([e, t], n, [s, i] = [0, 0]) {
  const r = Ct(n), a = Math.cos(r), o = Math.sin(r), l = e - s, h = t - i;
  return [s + l * a - h * o, i + l * o + h * a];
}
function Ce(e, t) {
  return Math.hypot(e[0] - t[0], e[1] - t[1]);
}
function yn(e, t) {
  return [Math.round(e[0] / t) * t, Math.round(e[1] / t) * t];
}
function Y(e) {
  return [Math.round(e[0] * 10) / 10, Math.round(e[1] * 10) / 10];
}
function Me(e, t, n, s) {
  const i = t / 2, r = n / 2;
  return [
    [-i, -r],
    [i, -r],
    [i, r],
    [-i, r]
  ].map((a) => P([e[0] + a[0], e[1] + a[1]], s, e));
}
function tt(e) {
  const t = e.x0 ?? 0, n = e.y0 ?? 0;
  return e.zellen.map(([s, i]) => ({ x: t + s * e.groesse, y: n + i * e.groesse, s: e.groesse }));
}
function nt(e, t, n = 0, s = 0) {
  return [Math.floor((e[0] - n) / t), Math.floor((e[1] - s) / t)];
}
function C(e) {
  if (e.art === "vieleck") return e.punkte;
  if (e.art === "rechteck") return Me(e.mitte, e.breite, e.tiefe, e.winkel);
  const t = tt(e), n = t.flatMap((l) => [l.x, l.x + l.s]), s = t.flatMap((l) => [l.y, l.y + l.s]);
  if (!n.length) return [];
  const [i, r, a, o] = [Math.min(...n), Math.max(...n), Math.min(...s), Math.max(...s)];
  return [
    [i, a],
    [r, a],
    [r, o],
    [i, o]
  ];
}
function Ut([e, t], n) {
  let s = !1;
  for (let i = 0, r = n.length - 1; i < n.length; r = i++) {
    const [a, o] = n[i], [l, h] = n[r];
    o > t != h > t && e < a + (t - o) * (l - a) / (h - o) && (s = !s);
  }
  return s;
}
function De(e, t) {
  if (t.art === "zellen") {
    const [n, s] = nt(e, t.groesse, t.x0 ?? 0, t.y0 ?? 0);
    return t.zellen.some(([i, r]) => i === n && r === s);
  }
  return Ut(e, C(t));
}
function zn(e) {
  if (!e.length) return [0, 0];
  let t = 0, n = 0, s = 0;
  for (let i = 0, r = e.length - 1; i < e.length; r = i++) {
    const [a, o] = e[r], [l, h] = e[i], c = a * h - l * o;
    t += c, n += (a + l) * c, s += (o + h) * c;
  }
  return Math.abs(t) < 1e-9 ? [e.reduce((i, r) => i + r[0], 0) / e.length, e.reduce((i, r) => i + r[1], 0) / e.length] : [n / (3 * t), s / (3 * t)];
}
function E(e) {
  if (e.art === "rechteck") return e.mitte;
  if (e.art === "zellen") {
    const t = tt(e), n = t.length || 1;
    return [t.reduce((s, i) => s + i.x + i.s / 2, 0) / n, t.reduce((s, i) => s + i.y + i.s / 2, 0) / n];
  }
  return zn(e.punkte);
}
function _n(e) {
  let t = 0;
  for (let n = 0, s = e.length - 1; n < e.length; s = n++)
    t += e[s][0] * e[n][1] - e[n][0] * e[s][1];
  return Math.abs(t) / 2;
}
function xe(e, t, n) {
  return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function Mn(e) {
  const t = e.length;
  for (let n = 0; n < t; n++)
    for (let s = n + 1; s < t; s++) {
      if (Math.abs(n - s) === 1 || Math.abs(n - s) === t - 1) continue;
      const [i, r] = [e[n], e[(n + 1) % t]], [a, o] = [e[s], e[(s + 1) % t]];
      if (xe(i, r, a) * xe(i, r, o) < 0 && xe(a, o, i) * xe(a, o, r) < 0) return !0;
    }
  return !1;
}
function Ue(e) {
  return e.art === "zellen" ? e.zellen.length ? "" : "Keine Zelle gewählt" : e.art === "rechteck" ? e.breite > 0 && e.tiefe > 0 ? "" : "Rechteck ohne Fläche" : e.punkte.length < 3 ? "Mindestens drei Ecken" : Mn(e.punkte) ? "Kanten überschneiden sich" : _n(e.punkte) < 1 ? "Vieleck ohne Fläche" : "";
}
function Ve(e, t, n) {
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map((r) => Y([r[0] + t, r[1] + n])) };
  if (e.art === "rechteck") return { ...e, mitte: Y([e.mitte[0] + t, e.mitte[1] + n]) };
  const s = Math.round(t / e.groesse), i = Math.round(n / e.groesse);
  return { ...e, zellen: e.zellen.map(([r, a]) => [r + s, a + i]) };
}
function Ae(e) {
  const t = Ct(e);
  return [-Math.sin(t), Math.cos(t)];
}
function Ne(e, t, n, s, i = 36) {
  const r = [];
  s >= 360 || r.push(e);
  const o = t - s / 2;
  for (let l = 0; l <= i; l++) {
    const h = o + s * l / i, [c, d] = Ae(h);
    r.push([e[0] + c * n, e[1] + d * n]);
  }
  return r;
}
function An(e, t) {
  const n = P(e, t.winkel);
  return [t.x + n[0], t.y + n[1]];
}
function ye(e, t) {
  const n = Math.atan2(-(t[0] - e[0]), t[1] - e[1]) * 180 / Math.PI;
  return Math.round(n * 10) / 10;
}
function Oe(e, t, n) {
  const s = n[0] - t[0], i = n[1] - t[1], r = s * s + i * i;
  if (r === 0) return Ce(e, t);
  const a = Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r));
  return Ce(e, [t[0] + a * s, t[1] + a * i]);
}
function Vt(e, t) {
  return P([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function Sn(e, t, n) {
  const s = (i) => Y(An(Vt(i, t), n));
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map(s) };
  if (e.art === "rechteck") {
    let i = e.winkel + n.winkel - t.winkel;
    return i > 180 && (i -= 360), i <= -180 && (i += 360), { ...e, mitte: s(e.mitte), winkel: Math.round(i * 10) / 10 };
  }
  return t.winkel !== n.winkel ? e : Ve(e, n.x - t.x, n.y - t.y);
}
function H(e, t) {
  const [n, s] = P(e, t.winkel);
  return [n + t.x, s + t.y];
}
function Rn(e, t) {
  return P([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function Tn(e, t, n) {
  if (e.length >= 3) return e;
  const s = [n];
  for (const d of t) s.push(...C(d));
  const i = s.map((d) => d[0]), r = s.map((d) => d[1]), a = 40, [o, l] = [Math.min(...i) - a, Math.max(...i) + a], [h, c] = [Math.min(...r) - a, Math.max(...r) + a];
  return [
    [o, h],
    [l, h],
    [l, c],
    [o, c]
  ];
}
function En(e, t = 100) {
  const n = {};
  let s = -1 / 0;
  for (const i of e)
    if (i.lage) {
      n[i.id] = i.lage;
      for (const r of i.outline) s = Math.max(s, H(r, i.lage)[0]);
    }
  s === -1 / 0 && (s = -t);
  for (const i of e) {
    if (i.lage) continue;
    const r = Math.min(...i.outline.map((l) => l[0])), a = Math.max(...i.outline.map((l) => l[0])), o = { x: s + t - r, y: 0, winkel: 0 };
    n[i.id] = o, s = o.x + a;
  }
  return n;
}
const Kt = {
  normal: "normal",
  ausgang: "ausgang",
  hundeplatz: "hundeplatz",
  stoerquelle: "stoerquelle",
  stelle: "stelle",
  durchgang: "durchgang"
};
class Pn {
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
function Gt(e, t) {
  const n = new Set(t.map((i) => i.name));
  if (!n.has(e)) return e;
  let s = 2;
  for (; n.has(`${e} ${s}`); ) s++;
  return `${e} ${s}`;
}
function ft(e, t, n, s = "normal") {
  return {
    name: Gt("Zone", t),
    art: s,
    form: e,
    regel: { ...n[Kt[s]] }
  };
}
function Ln(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s[t] = Y(n), { ...e, punkte: s };
}
function gt(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s.splice(t + 1, 0, Y(n)), { ...e, punkte: s };
}
function Hn(e, t) {
  return e.art !== "vieleck" || e.punkte.length <= 3 ? e : { ...e, punkte: e.punkte.filter((n, s) => s !== t) };
}
function bt(e, t, n) {
  const [s, i] = nt(t, e.groesse, e.x0 ?? 0, e.y0 ?? 0), r = e.zellen.some(([a, o]) => a === s && o === i);
  return n && !r ? { ...e, zellen: [...e.zellen, [s, i]] } : !n && r ? { ...e, zellen: e.zellen.filter(([a, o]) => a !== s || o !== i) } : e;
}
function $t(e, t) {
  return {
    art: "rechteck",
    mitte: Y([(e[0] + t[0]) / 2, (e[1] + t[1]) / 2]),
    breite: Math.round(Math.abs(t[0] - e[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(t[1] - e[1]) * 10) / 10,
    winkel: 0
  };
}
function kt(e) {
  for (const t of e) {
    if (!t.name.trim()) return "Eine Zone hat keinen Namen";
    const n = Ue(t.form);
    if (n) return `${t.name}: ${n}`;
  }
  return "";
}
function Zn(e, t, n) {
  const s = e.name.toLowerCase(), i = s.includes("bett"), a = s.includes("tür") || s.includes("tuer") || s.includes("door") ? "ausgang" : "normal";
  return {
    name: Gt(e.name, t),
    art: a,
    form: e.form,
    regel: { ...n[i ? "bett" : Kt[a]] }
  };
}
const Ke = [
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
function Se(e) {
  return Ke.find((t) => t.rolle === e) ?? Ke[1];
}
function he(e) {
  return e.art === "ausgang" ? "tuer" : e.art === "hundeplatz" ? "hund" : e.art === "stelle" ? "stelle" : e.art === "durchgang" ? "durchgang" : e.art === "stoerquelle" ? "ignorieren" : e.regel.schlaefer_halten ? "bett" : "bereich";
}
function wt(e, t, n) {
  const s = Se(t), i = { ...e, art: s.art, regel: { ...n[s.vorlage] } };
  return s.art !== "ausgang" && delete i.fuehrt_zu, i;
}
function vt(e) {
  return e === 0 ? "sofort" : `nach ${String(e).replace(".", ",")} s`;
}
function xt(e) {
  const t = e.regel;
  if (e.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const n = [`belegt ${vt(t.belegt_nach_s)}`, `frei ${vt(t.frei_nach_s)}`];
  t.schlaefer_halten && n.push("hält Schläfer"), t.max_personen === 1 && n.push("eine Person"), t.hund_ignorieren && n.push("ohne Hund");
  const s = n.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}
function In(e, t, n, s = 10) {
  const i = e.breite / 2, r = e.tiefe / 2, a = [
    t === 0 || t === 3 ? e.mitte[0] + i : e.mitte[0] - i,
    t === 0 || t === 1 ? e.mitte[1] + r : e.mitte[1] - r
  ], o = Math.max(s, Math.abs(n[0] - a[0])), l = Math.max(s, Math.abs(n[1] - a[1])), h = n[0] >= a[0] ? 1 : -1, c = n[1] >= a[1] ? 1 : -1;
  return {
    ...e,
    winkel: 0,
    breite: Math.round(o * 10) / 10,
    tiefe: Math.round(l * 10) / 10,
    mitte: Y([a[0] + h * o / 2, a[1] + c * l / 2])
  };
}
function Dn(e, t) {
  const n = e.fuehrt_zu ?? "";
  return n ? n === "aussen" ? "nach draußen oder in einen Raum ohne Sensor" : t.find((s) => s.id === n)?.name ?? "unbekannter Raum" : "noch nicht eingetragen";
}
function Nn(e) {
  let t = (e % 360 + 540) % 360 - 180;
  return t === -180 && (t = 180), t;
}
const Be = (e) => Math.round(e * 10) / 10 + 0;
function yt(e, t, n) {
  return e.art === "vieleck" ? { ...e, punkte: e.punkte.map((s) => P(s, n, t).map((i) => Be(i))) } : e.art === "rechteck" ? { ...e, mitte: P(e.mitte, n, t).map((s) => Be(s)), winkel: Be(Nn(e.winkel + n)) } : e;
}
function te(e) {
  return e.map((t, n) => {
    const s = e[(n + 1) % e.length];
    return [(t[0] + s[0]) / 2, (t[1] + s[1]) / 2];
  });
}
function Ze(e, t) {
  return [e[t], e[(t + 1) % e.length]];
}
function ge(e, t, n) {
  const [s, i] = Ze(e, t), r = i[0] - s[0], a = i[1] - s[1], o = Math.hypot(r, a);
  if (!o) return 0;
  const l = ((n[0] - s[0]) * r + (n[1] - s[1]) * a) / o;
  return Math.max(0, Math.min(o, l));
}
function On(e, t, n, s, i = 20) {
  const [r, a] = Ze(e, t), o = Math.hypot(a[0] - r[0], a[1] - r[1]);
  let l = Math.round(ge(e, t, n) / 5) * 5, h = Math.round(ge(e, t, s) / 5) * 5;
  return h < l && ([l, h] = [h, l]), h - l < i ? null : { kante: t, von: l, bis: Math.min(h, Math.floor(o)), art: "tuer" };
}
function ce(e, t) {
  const [n, s] = Ze(e, t.kante), i = Math.hypot(s[0] - n[0], s[1] - n[1]) || 1, r = (a) => [n[0] + (s[0] - n[0]) * a / i, n[1] + (s[1] - n[1]) * a / i];
  return [r(t.von), r(t.bis)];
}
function zt(e, t, n) {
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
function Bn(e, t, n = 20) {
  const s = [];
  for (const i of t) {
    if (i.kante >= e.length) continue;
    const [r, a] = Ze(e, i.kante), o = Math.floor(Math.hypot(a[0] - r[0], a[1] - r[1])), l = Math.min(i.bis, o);
    l - i.von >= n && s.push({ ...i, bis: l });
  }
  return s;
}
const Wn = Jt`
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
  .wiz-anker circle {
    fill: var(--card);
    stroke: var(--rz-stelle);
    stroke-width: 2;
    stroke-dasharray: 4 3;
  }
  .wiz-anker.vorschlag circle {
    fill: color-mix(in srgb, var(--rz-stelle) 25%, var(--card));
    stroke-dasharray: none;
    stroke-width: 3;
  }
  .wiz-anker text {
    text-anchor: middle;
    font-size: 14px;
    font-weight: 700;
    fill: var(--primary-text-color);
    pointer-events: none;
  }
  .wiz-text {
    font-size: 1.05rem;
    line-height: 1.45;
    margin: 8px 0;
  }
  .wiz-wahl {
    display: grid;
    gap: 8px;
    margin: 8px 0;
  }
  .wiz-wahl button {
    justify-content: flex-start;
    min-height: 48px;
    border: 2px solid var(--line);
    border-radius: 8px;
    gap: 10px;
  }
  .wiz-buchstabe {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--rz-stelle);
    font-weight: 700;
    color: var(--primary-text-color);
  }
  /* Figuren im Assistenten: „Das bin ich“, „Hund“, „Aufräumen“. */
  .wiz-figuren {
    border-top: 2px solid var(--line);
    margin-top: 12px;
    padding-top: 8px;
  }
  .wiz-figurliste {
    list-style: none;
    margin: 4px 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }
  .wiz-figurliste li {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    border: 2px solid var(--line);
    border-radius: 8px;
    padding: 4px 8px;
  }
  .wiz-figurliste li.ich {
    border-color: var(--rz-person);
  }
  .wiz-figurliste li.hund {
    border-color: var(--rz-tier);
  }
  .wiz-figurtext {
    flex: 1;
    min-width: 8em;
  }
  .wiz-nr {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--rz-person);
    color: var(--text-primary-color, #fff);
    font-weight: 700;
  }
  .wiz-nr.tier {
    background: var(--rz-tier);
    color: var(--primary-text-color);
  }
  .wiz-nr.held {
    background: none;
    border: 2px dashed var(--rz-person);
    color: var(--primary-text-color);
  }
  .figure-nr {
    text-anchor: middle;
    font-size: 11px;
    font-weight: 700;
    fill: var(--text-primary-color, #fff);
    pointer-events: none;
  }
  /* Handy-Assistent: großer Plan oben, ein Schritt unten, große Knöpfe. */
  .layout.handy {
    flex-direction: column;
  }
  .layout.handy .stage {
    flex: 1 1 55%;
    min-height: 40vh;
  }
  .layout.handy .tools,
  .layout.handy .handle,
  .layout.handy .plus {
    display: none;
  }
  .handy-sheet {
    flex: 0 1 auto;
    max-height: 55vh;
    overflow: auto;
    padding: 8px 16px 16px;
    border-top: 2px solid var(--line);
    background: var(--card);
  }
  .handy-sheet button.primary {
    width: 100%;
    min-height: 56px;
    font-size: 1.1rem;
    justify-content: center;
  }
  .handy-sheet .actions .spacer {
    display: none;
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
  /* Im Raum: die Liste wächst mit (Einstellungen je Melder), kein eigener Rollbalken. */
  .melder-liste.voll {
    max-height: none;
    overflow: visible;
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
`, _t = 600;
function Fn(e) {
  const t = Math.max(1, Math.ceil(e * 3)), n = new Float32Array(2 * t + 1);
  let s = 0;
  for (let i = -t; i <= t; i++) {
    const r = Math.exp(-(i * i) / (2 * e * e));
    n[i + t] = r, s += r;
  }
  for (let i = 0; i < n.length; i++) n[i] /= s;
  return n;
}
function Mt(e, t, n = 8) {
  if (!e.length || !(t > 0)) return null;
  let s = 1 / 0, i = -1 / 0, r = 1 / 0, a = -1 / 0;
  for (const [$, k] of e)
    s = Math.min(s, $), i = Math.max(i, $), r = Math.min(r, k), a = Math.max(a, k);
  const o = Math.max(0.6, n / t), l = Fn(o), h = (l.length - 1) / 2;
  s -= h, r -= h;
  const c = Math.min(_t, i - s + 1 + h), d = Math.min(_t, a - r + 1 + h), f = new Float32Array(c * d);
  for (const [$, k, _] of e) {
    const z = $ - s, M = k - r;
    z >= 0 && z < c && M >= 0 && M < d && _ > 0 && (f[M * c + z] += _);
  }
  const p = new Float32Array(c * d);
  for (let $ = 0; $ < d; $++)
    for (let k = 0; k < c; k++) {
      const _ = f[$ * c + k];
      if (_)
        for (let z = -h; z <= h; z++) {
          const M = k + z;
          M >= 0 && M < c && (p[$ * c + M] += _ * l[z + h]);
        }
    }
  const g = new Float32Array(c * d);
  let b = 0;
  for (let $ = 0; $ < d; $++)
    for (let k = 0; k < c; k++) {
      const _ = p[$ * c + k];
      if (_)
        for (let z = -h; z <= h; z++) {
          const M = $ + z;
          M >= 0 && M < d && (g[M * c + k] += _ * l[z + h]);
        }
    }
  for (let $ = 0; $ < g.length; $++) b = Math.max(b, g[$]);
  return { x0: s * t, y0: r * t, zelle: t, nx: c, ny: d, werte: g, max: b };
}
function jn(e, t, n = 0.2) {
  return !(e > n) || !(t > 0) ? 0 : Math.min(1, Math.log1p(e) / Math.log1p(t));
}
function Cn(e, t, n = 0.85) {
  const s = new Uint8ClampedArray(e.nx * e.ny * 4);
  for (let i = 0; i < e.ny; i++) {
    const r = e.ny - 1 - i;
    for (let a = 0; a < e.nx; a++) {
      const o = jn(e.werte[i * e.nx + a], e.max);
      if (!o) continue;
      const l = (r * e.nx + a) * 4;
      s[l] = t[0], s[l + 1] = t[1], s[l + 2] = t[2], s[l + 3] = Math.round(255 * n * (0.15 + 0.85 * o));
    }
  }
  return s;
}
function At(e) {
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
function Un(e, t = 300, n = 0.2, s = 15) {
  const { nx: i, ny: r, werte: a } = e, o = e.max * n, l = new Uint8Array(i * r), h = [];
  for (let c = 0; c < i * r; c++) {
    if (l[c] || a[c] < o) continue;
    const d = [c];
    l[c] = 1;
    let [f, p, g, b, $] = [1 / 0, -1 / 0, 1 / 0, -1 / 0, 0];
    for (; d.length; ) {
      const z = d.pop(), M = z % i, S = z / i | 0;
      f = Math.min(f, M), p = Math.max(p, M), g = Math.min(g, S), b = Math.max(b, S), $ += a[z];
      for (const A of [M > 0 ? z - 1 : -1, M < i - 1 ? z + 1 : -1, z - i, z + i])
        A < 0 || A >= i * r || l[A] || a[A] < o || (l[A] = 1, d.push(A));
    }
    if ($ < t) continue;
    const k = (p - f + 1) * e.zelle + 2 * s, _ = (b - g + 1) * e.zelle + 2 * s;
    h.push({
      mitte: [Math.round(e.x0 + (f + p + 1) / 2 * e.zelle), Math.round(e.y0 + (g + b + 1) / 2 * e.zelle)],
      breite: Math.round(k),
      tiefe: Math.round(_),
      sekunden: Math.round($)
    });
  }
  return h.sort((c, d) => d.sekunden - c.sekunden);
}
function T(e) {
  const t = e;
  return t?.code === "unknown_command" ? Vn : t?.message ?? String(e);
}
const Vn = "Raumzonen wurde aktualisiert und wartet auf einen Neustart von Home Assistant (Einstellungen → System → Neu starten).";
function Kn(e, t, n) {
  return `${e}/#${t.id || n}`;
}
function pe(e, t) {
  return e.name?.trim() || (e.art === "offen" ? `Durchgang ${t + 1}` : `Tür ${t + 1}`);
}
function We(e, t, n, s = 150) {
  const i = e.find((o) => o.id === t);
  if (!i?.haus_gesetzt) return null;
  const r = H(n, { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel });
  let a = null;
  for (const o of e)
    if (!(o.id === t || !o.haus_gesetzt))
      for (const l of N(o)) {
        const [h, c] = H(l.punkt, { x: o.haus_x, y: o.haus_y, winkel: o.haus_winkel }), d = Math.hypot(h - r[0], c - r[1]);
        d <= s && (!a || d < a.abstand) && (a = { tuer: l, abstand: d });
      }
  return a;
}
function Ee(e, t) {
  const n = e.length;
  if (n < 3 || t.kante < 0 || t.kante >= n) return null;
  const [s, i] = e[t.kante], [r, a] = e[(t.kante + 1) % n], o = Math.hypot(r - s, a - i);
  if (!o) return null;
  const l = (t.von + t.bis) / 2 / o;
  return [s + (r - s) * l, i + (a - i) * l];
}
function N(e) {
  const t = [];
  for (const n of e.zonen)
    n.art !== "ausgang" || !n.id || t.push({ key: `${e.id}/${n.id}`, raumId: e.id, name: n.name, punkt: E(n.form), ziel: n.fuehrt_zu ?? "", gegenstueck: n.gegenstueck ?? "", zoneId: n.id });
  return (e.oeffnungen ?? []).forEach((n, s) => {
    const i = Ee(e.umriss, n);
    i && t.push({ key: Kn(e.id, n, s), raumId: e.id, name: pe(n, s), punkt: i, ziel: n.fuehrt_zu ?? "", gegenstueck: n.gegenstueck ?? "", oeffnung: s });
  }), t;
}
function Gn(e, t = 60) {
  const n = e.flat().filter(([i, r]) => r > i).sort((i, r) => i[0] - r[0]), s = [];
  for (const [i, r] of n) {
    const a = s[s.length - 1];
    a && i - a[1] <= t ? a[1] = Math.max(a[1], r) : s.push([i, r]);
  }
  return s;
}
function qn(e) {
  return e.reduce((t, [n, s]) => t + (s - n), 0);
}
function Xn(e, t = 30) {
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
function Jn(e, t, n = 60) {
  const s = e.length;
  if (s < 3 || t.kante < 0 || t.kante >= s) return null;
  const [i, r] = e[t.kante], [a, o] = e[(t.kante + 1) % s], l = Math.hypot(a - i, o - r);
  if (!l) return null;
  const [h, c] = [(a - i) / l, (o - r) / l], d = (t.von + t.bis) / 2, f = [i + h * d, r + c * d];
  let [p, g] = [-c, h];
  return Ut([f[0] + p * 5, f[1] + g * 5], e) || ([p, g] = [-p, -g]), {
    art: "rechteck",
    mitte: [Math.round(f[0] + p * n / 2), Math.round(f[1] + g * n / 2)],
    breite: Math.round(t.bis - t.von),
    tiefe: n,
    winkel: Math.round(Math.atan2(c, h) * 180 / Math.PI)
  };
}
function Yn(e, t, n = 80) {
  const s = Ee(e.umriss, t);
  return s ? e.zonen.some((i) => i.art === "ausgang" && C(i.form).length && Math.hypot(E(i.form)[0] - s[0], E(i.form)[1] - s[1]) <= n) : !0;
}
function Ge(e) {
  if (e.length < 3) return "Es braucht drei Stellen.";
  let t = 1 / 0;
  for (let a = 0; a < e.length; a++)
    for (let o = a + 1; o < e.length; o++) t = Math.min(t, Math.hypot(e[a][0] - e[o][0], e[a][1] - e[o][1]));
  const [n, s, i] = e, r = Math.abs((s[0] - n[0]) * (i[1] - n[1]) - (i[0] - n[0]) * (s[1] - n[1])) / 2;
  return t < 100 ? "Zwei Stellen liegen zu nah beieinander (weniger als 1 m). Weiter auseinander gehen." : r < 5e3 ? "Die drei Stellen liegen fast auf einer Linie. Eine Stelle seitlich wählen." : "";
}
function Qn(e, t) {
  const n = Math.min(e.length, t.length);
  if (n < 2) return null;
  const s = (b) => [b.reduce(($, k) => $ + k[0], 0) / n, b.reduce(($, k) => $ + k[1], 0) / n], i = s(e.slice(0, n)), r = s(t.slice(0, n));
  let a = 0, o = 0;
  for (let b = 0; b < n; b++) {
    const [$, k] = [e[b][0] - i[0], e[b][1] - i[1]], [_, z] = [t[b][0] - r[0], t[b][1] - r[1]];
    a += $ * z - k * _, o += $ * _ + k * z;
  }
  if (!a && !o) return null;
  const l = Math.atan2(a, o), [h, c] = [Math.cos(l), Math.sin(l)], d = r[0] - (i[0] * h - i[1] * c), f = r[1] - (i[0] * c + i[1] * h);
  let p = 0;
  for (let b = 0; b < n; b++) {
    const $ = d + e[b][0] * h - e[b][1] * c, k = f + e[b][0] * c + e[b][1] * h;
    p += Math.hypot($ - t[b][0], k - t[b][1]);
  }
  let g = l * 180 / Math.PI;
  return g = Math.round(g * 10) / 10, g <= -180 && (g += 360), { x: Math.round(d), y: Math.round(f), winkel: g, rest_cm: Math.round(p / n * 10) / 10 };
}
function es(e) {
  if (!e.length) return null;
  const t = (i) => {
    const r = [...i].sort((o, l) => o - l), a = r.length >> 1;
    return r.length % 2 ? r[a] : (r[a - 1] + r[a]) / 2;
  }, n = [t(e.map((i) => i[0])), t(e.map((i) => i[1]))], s = e.map((i) => Math.hypot(i[0] - n[0], i[1] - n[1]));
  return { punkt: [Math.round(n[0] * 10) / 10, Math.round(n[1] * 10) / 10], streuung_cm: Math.round(t(s) * 10) / 10 };
}
function ze([e, t], n) {
  let s = !1;
  for (let i = 0, r = n.length - 1; i < n.length; r = i++) {
    const [a, o] = n[i], [l, h] = n[r];
    o > t != h > t && e < (l - a) * (t - o) / (h - o) + a && (s = !s);
  }
  return s;
}
function ts(e, t = [], n = 50) {
  const s = e.length;
  if (s < 3) return [];
  const i = [], r = ([a, o]) => {
    const l = Math.hypot(a, o) || 1;
    return [a / l, o / l];
  };
  e.forEach((a, o) => {
    const l = r([e[(o + s - 1) % s][0] - a[0], e[(o + s - 1) % s][1] - a[1]]), h = r([e[(o + 1) % s][0] - a[0], e[(o + 1) % s][1] - a[1]]);
    let c = r([l[0] + h[0], l[1] + h[1]]);
    const d = Math.sqrt(Math.max(0.05, (1 - (l[0] * h[0] + l[1] * h[1])) / 2)), f = Math.min(n / d, 3 * n);
    let p = [a[0] + c[0] * f, a[1] + c[1] * f];
    ze(p, e) || (c = [-c[0], -c[1]], p = [a[0] + c[0] * f, a[1] + c[1] * f]), ze(p, e) && i.push({ punkt: [Math.round(p[0]), Math.round(p[1])], name: `Ecke ${o + 1}` });
  });
  for (const a of t)
    for (const [o, l] of [
      [n, 0],
      [-n, 0],
      [0, n],
      [0, -n]
    ]) {
      const h = [a.punkt[0] + o, a.punkt[1] + l];
      if (ze(h, e) && !ze([a.punkt[0] - o, a.punkt[1] - l], e)) {
        i.push({ punkt: [Math.round(h[0]), Math.round(h[1])], name: `vor ${a.name}` });
        break;
      }
    }
  return i;
}
function St(e) {
  let t = [], n = 0;
  for (let s = 0; s < e.length; s++)
    for (let i = s + 1; i < e.length; i++)
      for (let r = i + 1; r < e.length; r++) {
        const a = [e[s].punkt, e[i].punkt, e[r].punkt];
        if (Ge(a)) continue;
        const [o, l, h] = a, c = Math.abs((l[0] - o[0]) * (h[1] - o[1]) - (h[0] - o[0]) * (l[1] - o[1]));
        c > n && ([t, n] = [[s, i, r], c]);
      }
  return t;
}
function ns(e) {
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
function ss(e, t) {
  const n = Math.floor(e.width / t), s = Math.floor(e.height / t), i = new Uint8Array(n * s), r = new Uint8Array(n * s), a = e.data;
  for (let l = 0; l < s; l++)
    for (let h = 0; h < n; h++) {
      let c = 0, d = 0;
      for (let f = 0; f < t; f++)
        for (let p = 0; p < t; p++) {
          const g = ((l * t + f) * e.width + (h * t + p)) * 4, [b, $, k] = [a[g], a[g + 1], a[g + 2]];
          k > b + 40 && k > $ + 10 && k > 120 && (c = 1), b + $ + k < 270 && (d = 1);
        }
      i[l * n + h] = c, r[l * n + h] = d;
    }
  const o = new Uint8Array(n * s);
  for (let l = 1; l < s - 1; l++)
    for (let h = 1; h < n - 1; h++)
      if (i[l * n + h]) for (let c = -1; c <= 1; c++) for (let d = -1; d <= 1; d++) o[(l + c) * n + h + d] = 1;
  return { w: n, h: s, blau: o, dunkel: r };
}
function is(e) {
  const { w: t, h: n, blau: s } = e, i = new Int32Array(t * n).fill(-1), r = new Int32Array(t * n);
  let a = 0;
  for (let o = 0; o < t * n; o++) {
    if (s[o] || i[o] >= 0) continue;
    let l = 0;
    for (r[l++] = o, i[o] = a; l; ) {
      const h = r[--l], c = h % t, d = [c > 0 ? h - 1 : -1, c < t - 1 ? h + 1 : -1, h - t, h + t];
      for (const f of d)
        f < 0 || f >= t * n || s[f] || i[f] >= 0 || (i[f] = a, r[l++] = f);
    }
    a++;
  }
  return { label: i, anzahl: a };
}
function rs(e, t, n, s) {
  const i = (f, p) => f >= 0 && p >= 0 && f < t && p < n && e[p * t + f] === s;
  let r = -1, a = -1;
  for (let f = 0; f < t * n; f++)
    if (e[f] === s) {
      r = f % t, a = Math.floor(f / t);
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
  ], l = [[r, a]];
  let [h, c] = [r, a], d = 7;
  for (let f = 0; f < t * n * 2; f++) {
    let p = !1;
    for (let g = 0; g < 8; g++) {
      const b = (d + 6 + g) % 8, [$, k] = [h + o[b][0], c + o[b][1]];
      if (i($, k)) {
        h = $, c = k, d = b, p = !0;
        break;
      }
    }
    if (!p || h === r && c === a) break;
    l.push([h, c]);
  }
  return l;
}
function qt(e, t, n) {
  const [s, i] = [n[0] - t[0], n[1] - t[1]], r = s * s + i * i, a = r ? Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r)) : 0;
  return Math.hypot(e[0] - t[0] - a * s, e[1] - t[1] - a * i);
}
function Pe(e, t) {
  if (e.length < 3) return e;
  let n = 0, s = 0;
  for (let a = 1; a < e.length - 1; a++) {
    const o = qt(e[a], e[0], e[e.length - 1]);
    o > n && (n = o, s = a);
  }
  if (n <= t) return [e[0], e[e.length - 1]];
  const i = Pe(e.slice(0, s + 1), t), r = Pe(e.slice(s), t);
  return [...i.slice(0, -1), ...r];
}
function as(e, t) {
  if (e.length < 4) return e;
  let n = 0, s = 0;
  for (let o = 1; o < e.length; o++) {
    const l = Math.hypot(e[o][0] - e[0][0], e[o][1] - e[0][1]);
    l > s && (s = l, n = o);
  }
  const i = Pe(e.slice(0, n + 1), t), r = Pe([...e.slice(n), e[0]], t);
  let a = [...i.slice(0, -1), ...r.slice(0, -1)];
  for (let o = !0; o && a.length > 3; ) {
    o = !1;
    for (let l = 0; l < a.length; l++) {
      const h = a[(l - 1 + a.length) % a.length], c = a[(l + 1) % a.length];
      if (Math.hypot(h[0] - c[0], h[1] - c[1]) < t * 3 && Math.hypot(a[l][0] - h[0], a[l][1] - h[1]) > t * 3 || qt(a[l], h, c) < t) {
        a = a.filter((f, p) => p !== l), o = !0;
        break;
      }
    }
  }
  return a;
}
function os(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const [s, i] = e[n], [r, a] = e[(n + 1) % e.length];
    t += s * a - r * i;
  }
  return Math.abs(t) / 2;
}
function ls(e, t = 2) {
  const n = ss(e, t), { w: s, h: i } = n, { label: r, anzahl: a } = is(n), o = new Int32Array(a), l = new Uint8Array(a), h = new Int32Array(a);
  for (let z = 0; z < s * i; z++) {
    const M = r[z];
    if (M < 0) continue;
    o[M]++, n.dunkel[z] && h[M]++;
    const S = z % s, A = z / s | 0;
    (S === 0 || A === 0 || S === s - 1 || A === i - 1) && (l[M] = 1);
  }
  const c = s * i * 0.015, d = [];
  for (let z = 0; z < a; z++)
    l[z] || o[z] < c || h[z] > o[z] * 0.3 || d.push(z);
  const f = Math.max(2, Math.hypot(s, i) * 6e-3), p = [], g = /* @__PURE__ */ new Map();
  for (const z of d) {
    const M = as(rs(r, s, i, z), f);
    M.length < 3 || (g.set(z, p.length), p.push({ punkte: M.map(([S, A]) => [(S + 0.5) * t, (A + 0.5) * t]), flaeche_px: os(M) * t * t }));
  }
  const b = Math.max(4, Math.round(16 / t)), $ = Math.max(6, Math.round(40 / t)), k = Math.max(2, Math.round(6 / t)), _ = [];
  return p.forEach((z, M) => {
    const S = z.punkte.map(([A, L]) => [A / t, L / t]);
    S.forEach((A, L) => {
      const I = S[(L + 1) % S.length], O = Math.hypot(I[0] - A[0], I[1] - A[1]);
      if (O < $) return;
      const [ae, Q] = [(I[0] - A[0]) / O, (I[1] - A[1]) / O], [oe, B] = [-Q, ae];
      let W = -1;
      const st = (D) => {
        if (W >= 0 && D - W >= $ && W > 2 && D < O - 2) {
          const U = (W + D) / 2;
          let ee = null;
          for (const V of [1, -1]) {
            const K = Math.round(A[0] + ae * U + oe * V * b * 2.5), G = Math.round(A[1] + Q * U + B * V * b * 2.5);
            if (K < 0 || G < 0 || K >= s || G >= i) continue;
            const ve = g.get(r[G * s + K]);
            ve !== void 0 && ve !== M && (ee = ve);
          }
          _.push({ raum: M, kante: L, von_px: W * t, bis_px: D * t, partner: ee });
        }
        W = -1;
      };
      for (let D = 0; D <= O; D++) {
        let U = !1, ee = 0;
        for (let V = -b; V <= b && !U; V++) {
          const K = Math.round(A[0] + ae * D + oe * V), G = Math.round(A[1] + Q * D + B * V);
          ee = K >= 0 && G >= 0 && K < s && G < i && n.dunkel[G * s + K] ? ee + 1 : 0, ee >= k && (U = !0);
        }
        !U && W < 0 && (W = D), U && W >= 0 && st(D);
      }
      st(O);
    });
  }), { breite: e.width, hoehe: e.height, raeume: p, luecken: _ };
}
function se(e) {
  const t = e.map((s) => s[0]), n = e.map((s) => s[1]);
  return { x0: Math.min(...t), y0: Math.min(...n), x1: Math.max(...t), y1: Math.max(...n) };
}
function Rt(e, t, n, s = [0, 0]) {
  const i = e.raeume[t], r = se(i.punkte), a = ([g, b]) => [Math.round((g - r.x0) * n + s[0]), Math.round((r.y1 - b) * n + s[1])];
  let o = i.punkte.map(a);
  const l = i.punkte.map((g, b) => b);
  let h = 0;
  o.forEach((g, b) => {
    g[0] + g[1] < o[h][0] + o[h][1] && (h = b);
  }), o = [...o.slice(h), ...o.slice(0, h)];
  const c = [...l.slice(h), ...l.slice(0, h)], d = o.length, f = [];
  e.luecken.forEach((g, b) => {
    if (g.raum !== t) return;
    const $ = c.indexOf(g.kante);
    if ($ < 0) return;
    const k = o[$], _ = o[($ + 1) % d], z = Math.hypot(_[0] - k[0], _[1] - k[1]), M = Math.max(0, Math.round(g.von_px * n)), S = Math.min(Math.floor(z), Math.round(g.bis_px * n));
    S - M >= 30 && f.push({ kante: $, von: M, bis: S, luecke: b });
  });
  const p = { x: Math.round(r.x0 * n - s[0]), y: Math.round((e.hoehe - r.y1) * n - s[1]), winkel: 0 };
  return { umriss: o, haus: p, luecken: f };
}
var hs = Object.defineProperty, cs = Object.getOwnPropertyDescriptor, x = (e, t, n, s) => {
  for (var i = s > 1 ? void 0 : s ? cs(t, n) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (i = (s ? a(t, n, i) : a(i)) || i);
  return s && i && hs(t, n, i), i;
};
const R = "raumzonen", us = 5, Z = 12, Tt = 8, ds = 30, Et = [1, 3, 8, 12, 24], ps = ["auswahl", "rechteck", "vieleck", "zellen", "umriss", "oeffnung"], F = "anwesenheit", Pt = 2, Lt = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" }
], ms = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung."
};
function Fe(e, t) {
  try {
    const n = localStorage.getItem(e);
    return n === null ? t : n === "1";
  } catch {
    return t;
  }
}
function je(e, t) {
  try {
    localStorage.setItem(e, t ? "1" : "0");
  } catch {
  }
}
function Ht(e, t) {
  const n = e[t], s = e[(t + 1) % e.length];
  return Math.hypot(s[0] - n[0], s[1] - n[1]);
}
function Zt(e) {
  return (e / 100).toFixed(2).replace(".", ",");
}
function de(e) {
  return `var(--rz-${e})`;
}
function It(e) {
  return e.map((t) => `${t[0].toFixed(1)},${t[1].toFixed(1)}`).join(" ");
}
function fs(e) {
  for (const t of [10, 20, 50, 100, 200, 500, 1e3, 2e3]) if (t >= e) return t;
  return 5e3;
}
let v = class extends fe {
  constructor() {
    super(...arguments), this.narrow = !1, this.raumId = "", this.zones = [], this.sensor = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 }, this.umriss = [], this.oeffnungen = [], this.selVertex = -1, this.selOpening = -1, this.openingDraft = null, this.selected = -1, this.sensorOpen = !1, this.tab = "zonen", this.tool = "auswahl", this.draft = [], this.rectDraft = null, this.hover = null, this.view = { cx: 0, cy: 250, scale: 0.8 }, this.size = { w: 800, h: 600 }, this.heatMin = 0, this.auswStunden = 8, this.auswLaedt = !1, this.auswFehler = "", this.wiz = null, this.handyVoll = !1, this.handyDienst = "", this.startParam = new URLSearchParams(window.location.search).get("assistent"), this.plan = null, this.planLaedt = !1, this.planAuswahl = null, this.planBilder = {}, this.planEdit = "", this.planAenderung = {}, this.planMessen = null, this.zeigePlan = Fe("raumzonen-zeige-plan", !0), this.masse = Fe("raumzonen-masse", !1), this.stockwerk = "", this.wieImHaus = Fe("raumzonen-wie-im-haus", !0), this.hausExtra = {}, this.neuRaum = null, this.profilStunden = 0, this.profilLaedt = !1, this.auswFigur = "", this.layersOpen = !1, this.layers = { figuren: !0, spuren: !0, ziele: !1, abdeckung: !0 }, this.dirty = !1, this.zonesFollow = !0, this.saving = !1, this.error = "", this.toast = "", this.page = "raum", this.lagen = {}, this.tueren = {}, this.tuerNamen = {}, this.hausLive = {}, this.hausSel = "", this.aufnahme = !0, this.melder = [], this.nurBereich = !0, this.nachlauf = 0, this.melderLagen = {}, this.zoneFuerMelder = "", this.aufnahmeTage = 30, this.history = new Pn(), this.drag = null, this.liveRoom = "", this.viewTouched = !1, this.sensorAnchor = null, this.hausUnsubs = [], this.fit = () => {
      const e = this.sensor, t = [[e.x, e.y]];
      if (this.page === "haus" && this.data) {
        t.length = 0;
        for (const g of this.hausRaeume()) {
          const b = this.lagen[g.id];
          b && t.push(...this.outlineOf(g).map(($) => H($, b)));
        }
      }
      for (const g of this.zones) t.push(...C(g.form));
      t.push(...this.umriss), t.length < 4 && this.page === "raum" && t.push(...Ne([e.x, e.y], e.winkel, Math.min(e.reichweite_cm, 500), e.oeffnung_grad, 8));
      const n = this.ansichtWinkel, s = t.map((g) => P(g, n)), i = s.map((g) => g[0]), r = s.map((g) => g[1]), [a, o, l, h] = [Math.min(...i), Math.max(...i), Math.min(...r), Math.max(...r)], c = Math.max(200, o - a), d = Math.max(200, h - l), f = Math.min(this.size.w / (c * 1.2), this.size.h / (d * 1.2)), p = P([(a + o) / 2, (l + h) / 2], -n);
      this.view = { cx: p[0], cy: p[1], scale: Math.max(0.05, Math.min(5, f)) };
    }, this.undo = () => {
      const e = this.history.undo();
      e && (this.zones = e.zones, this.sensor = e.sensor, this.umriss = e.umriss, this.oeffnungen = e.oeffnungen ?? [], this.selVertex = -1, this.selOpening = -1, this.selected >= this.zones.length && (this.selected = -1), this.dirty = !0);
    }, this.finishDraft = () => {
      if (this.draft.length >= 3)
        if (this.tool === "umriss")
          this.remember(), this.umriss = this.draft, this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
        else {
          const e = { art: "vieleck", punkte: this.draft }, t = Ue(e);
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
        this.data = e, this.ladePlanBilder(), this.error = "", this.startParam && e.raeume.some((n) => n.id === this.startParam) && (this.raumId = this.startParam, this.page = "raum", this.handyVoll = !0, this.startParam = null);
        const t = e.raeume.some((n) => n.id === this.raumId);
        this.page === "haus" && e.raeume.length ? (this.raumId = t ? this.raumId : e.raeume[0].id, this.openHaus(!0)) : this.selectRoom(t ? this.raumId : e.raeume[0]?.id ?? "", !0);
      } catch (e) {
        this.error = `Laden fehlgeschlagen: ${T(e)}`;
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
      this.ausw = void 0, this.auswFehler = s.code === "off" ? "off" : `Auswertung fehlgeschlagen: ${T(n)}`;
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
    const e = this.istMelder, t = e ? this.zones.find((s) => !(s.melder ?? []).some((i) => this.melder.includes(i))) : void 0, n = e ? this.melder.length ? t ? `Zone „${t.name}“: bitte den Melder wählen, der sie meldet.` : kt(this.zones) : "Mindestens einen Melder wählen." : kt(this.zones);
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
        oeffnungen: Bn(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage
      }), this.dirty = !1, this.showToast("Gespeichert."), await this.unsubscribeLive(), await new Promise((s) => window.setTimeout(s, 1500)), await this.load();
    } catch (s) {
      this.showToast(`Nicht gespeichert: ${T(s)}`);
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
        for (const n of e.zonen) t.push(Zn(n, t, this.data.vorlagen));
        this.zones = t, this.dirty = !0, this.showToast(`${e.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
      } catch (e) {
        this.showToast(`Konverter-Zonen nicht lesbar: ${T(e)}`);
      }
  }
  // -- Hausplan -------------------------------------------------------------
  outlineOf(e) {
    return e.art === "melder" && e.umriss.length < 3 ? [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300]
    ] : Tn(
      e.umriss,
      e.zonen.map((t) => t.form),
      [e.sensor.x, e.sensor.y]
    );
  }
  openHaus(e = !1) {
    if (!this.data || !e && this.page === "haus" || !e && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const t = this.data.raeume;
    this.lagen = En(
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
    const t = e.figuren.find((s) => s.markierung === "ich");
    if (t) return t.gehalten ? { punkt: null, hinweis: "Deine Figur ist gerade nicht zu sehen. Kurz bewegen." } : { punkt: [t.x, t.y], hinweis: "" };
    const n = e.figuren.filter((s) => !s.gehalten && !s.tags.some((i) => ["wiederhergestellt", "stoerung", "hund", "echo"].includes(i)));
    return n.length === 0 ? { punkt: null, hinweis: "Der Sensor sieht gerade niemanden." } : n.length > 1 ? { punkt: null, hinweis: "Der Sensor sieht mehr als eine Figur. Tippe unten bei deiner Figur auf „Das bin ich“." } : { punkt: [n[0].x, n[0].y], hinweis: "" };
  }
  /** Figuren, die man im Plan sieht (ohne Platzhalter und Störquellen). */
  sichtbareFiguren() {
    return (this.live?.figuren ?? []).filter((e) => !e.tags.includes("wiederhergestellt") && !e.tags.includes("stoerung"));
  }
  /** Knöpfe „Das bin ich“ / „Das ist der Hund“: Markierung setzen oder wieder weg. */
  async figurMarkieren(e, t) {
    if (!this._hass) return;
    const n = e.markierung === t ? null : t;
    try {
      await this._hass.callWS({ type: `${R}/figur/markieren`, raum_id: this.raumId, figur: e.id, markierung: n });
    } catch (s) {
      this.showToast(`Nicht markiert: ${T(s)}`);
    }
  }
  /** Knopf „Aufräumen“: alle Figuren außer „ich“ entfernen (mit Rückfrage). */
  async figurenAufraeumen() {
    if (!this._hass) return;
    const e = this.live?.figuren.find((n) => n.markierung === "ich");
    if (confirm(e ? "Alle Figuren außer dir entfernen? Wer wirklich da ist und sich bewegt, taucht gleich wieder auf. Eine Zone kann dadurch frei werden." : "Alle Figuren entfernen? Wer wirklich da ist und sich bewegt, taucht gleich wieder auf. Eine Zone (z. B. das Bett) kann dadurch frei werden."))
      try {
        const n = await this._hass.callWS({ type: `${R}/figuren/aufraeumen`, raum_id: this.raumId, behalten: e ? [e.id] : [] });
        this.showToast(n.entfernt === 1 ? "1 Figur entfernt." : `${n.entfernt} Figuren entfernt.`);
      } catch (n) {
        this.showToast(`Nicht aufgeräumt: ${T(n)}`);
      }
  }
  /** Liste der Figuren im Assistenten: wer bin ich, wer ist der Hund, aufräumen. */
  renderFigurenWahl() {
    if (!this.kannAendern || !this.live) return m;
    const e = this.sichtbareFiguren();
    return u`<div class="wiz-figuren">
      <p class="hint small">
        ${e.length > 1 ? "Mehrere Figuren im Raum: Sag Raumzonen, welche du bist. Den Hund kannst du ausschließen, Fehlerkennungen wegräumen." : "Figuren im Raum (Nummer wie im Plan):"}
      </p>
      ${e.length ? u`<ul class="wiz-figurliste">
            ${e.map(
      (t) => u`<li class=${t.markierung ?? ""}>
                <span class="wiz-nr ${t.markierung === "hund" || t.tags.includes("hund") ? "tier" : ""} ${t.gehalten ? "held" : ""}">${t.id}</span>
                <span class="wiz-figurtext">${this.figurText(t)}</span>
                <button class="text small" aria-pressed=${t.markierung === "ich" ? "true" : "false"} @click=${() => void this.figurMarkieren(t, "ich")}>
                  <ha-icon icon="mdi:account"></ha-icon>${t.markierung === "ich" ? "Bin ich ✓" : "Das bin ich"}
                </button>
                <button class="text small" aria-pressed=${t.markierung === "hund" ? "true" : "false"} @click=${() => void this.figurMarkieren(t, "hund")}>
                  <ha-icon icon="mdi:dog-side"></ha-icon>${t.markierung === "hund" ? "Hund ✓" : "Hund"}
                </button>
              </li>`
    )}
          </ul>` : u`<p class="hint small">Der Sensor sieht gerade niemanden.</p>`}
      <div class="actions">
        <button class="text small" ?disabled=${!e.length} @click=${() => void this.figurenAufraeumen()}>
          <ha-icon icon="mdi:broom"></ha-icon>Aufräumen
        </button>
      </div>
    </div>`;
  }
  figurText(e) {
    return e.markierung === "ich" ? "Du" : e.markierung === "hund" ? "Hund (zählt nicht)" : e.tags.includes("hund") || e.art === "pet" ? "vielleicht der Hund" : e.gehalten ? "gerade nicht gesehen (gehalten)" : e.bewegt ? "bewegt sich" : "steht still";
  }
  wizMessen() {
    const e = this.wiz;
    e && (window.clearInterval(this.wizTimer), this.wiz = { ...e, fehler: void 0, messung: { bis: Date.now() + Tt * 1e3, punkte: [], hinweis: "" } }, this.wizTimer = window.setInterval(() => {
      const t = this.wiz;
      if (!t?.messung) return;
      const { punkt: n, hinweis: s } = this.wizPerson(), i = n ? [...t.messung.punkte, n] : t.messung.punkte;
      if (Date.now() < t.messung.bis) {
        this.wiz = { ...t, messung: { ...t.messung, punkte: i, hinweis: s } };
        return;
      }
      window.clearInterval(this.wizTimer);
      const r = es(i);
      if (!r || i.length < 8) {
        this.wiz = { ...t, messung: void 0, fehler: s || "Zu wenig gesehen. Noch einmal versuchen." };
        return;
      }
      if (r.streuung_cm > ds) {
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
      const i = t.raum.map((o, l) => l === s ? e : o), r = i.every(Boolean), a = r ? Ge(i) : "";
      this.wiz = { ...t, raum: i, messung: void 0, aktiv: r ? 0 : s + 1, schritt: r && !a ? "umhaengen" : "vorher", fehler: a || void 0 }, a && (this.wiz = { ...this.wiz, raum: [null, null, null], aktiv: 0 });
    } else {
      const i = t.sensor.map((r, a) => a === s ? Vt(e, n) : r);
      this.wiz = { ...t, sensor: i, messung: void 0 }, this.wizWeiter();
    }
    this.wizSpeichern();
  }
  /** Handy-Ansicht des Assistenten: großer Plan, ein Schritt unten. */
  get handyAktiv() {
    return this.page === "raum" && this.kannAendern && !this.istMelder && (this.handyVoll || this.narrow && !!this.wiz);
  }
  /** Nachricht in die Home-Assistant-App: Antippen öffnet den Assistenten dieses Raums. */
  async aufsHandy() {
    if (this._hass)
      try {
        if (!this.handyZiele && (this.handyZiele = (await this._hass.callWS({ type: `${R}/handy/ziele` })).ziele, this.handyDienst = this.handyZiele[0]?.dienst ?? "", this.handyZiele.length > 1)) {
          this.showToast("Handy wählen, dann noch einmal „Aufs Handy schicken“.");
          return;
        }
        if (!this.handyDienst) {
          this.showToast("Kein Handy mit der Home-Assistant-App gefunden. Am Handy die App installieren und anmelden.");
          return;
        }
        await this._hass.callWS({ type: `${R}/handy/senden`, raum_id: this.raumId, dienst: this.handyDienst });
        const e = this.handyZiele.find((t) => t.dienst === this.handyDienst)?.name ?? "Handy";
        this.showToast(`Nachricht an „${e}“ geschickt. Am Handy antippen.`);
      } catch (e) {
        this.showToast(`Nicht geschickt: ${T(e)}`);
      }
  }
  /** Feste Stellen zum Hinstellen: Ecken und vor den Türen. */
  wizAnker() {
    const e = this.oeffnungen.map((t, n) => ({ punkt: Ee(this.umriss, t), name: pe(t, n) })).filter((t) => !!t.punkt);
    return ts(this.umriss, e);
  }
  /** Einmessen: wählt gerade jemand die nächste Stelle (vor dem Messen)? */
  get wizWaehlt() {
    const e = this.wiz;
    return !!e && e.modus === "einmessen" && e.schritt === "nachher" && !e.messung && this.page === "raum";
  }
  /** Einmessen: Stelle gewählt (Anker antippen rastet ein, sonst der angetippte Punkt). */
  wizStelle(e, t) {
    const n = this.wiz;
    if (!n) return;
    let s = e, i = t ?? "die angetippte Stelle";
    if (!t) {
      const [o, l] = this.toScreen(e);
      let h = 40;
      for (const c of this.wizAnker()) {
        const [d, f] = this.toScreen(c.punkt), p = Math.hypot(d - o, f - l);
        p < h && ([h, s, i] = [p, c.punkt, c.name]);
      }
    }
    const r = n.raum.map((o, l) => l === n.aktiv ? s : o), a = [...n.namen ?? [null, null, null]];
    a[n.aktiv] = i, this.wiz = { ...n, raum: r, namen: a, fehler: void 0 };
  }
  wizWeiter() {
    const e = this.wiz;
    if (!e) return;
    const t = e.aktiv;
    if (t < 2) {
      this.wiz = { ...e, aktiv: t + 1 };
      return;
    }
    const n = e.raum, s = Ge(n), i = Qn(e.sensor, n);
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
        for (const s of ns(new Uint8Array(await e.arrayBuffer()))) {
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
      this.showToast(`Grundriss nicht gelesen: ${T(n)}`);
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
      this.showToast(`Grundriss nicht gelesen: ${T(i)}`);
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
      const a = r.getImageData(0, 0, i.width, i.height), o = ls({ width: a.width, height: a.height, data: a.data }), l = {};
      o.luecken.forEach((c, d) => l[d] = c.partner !== null ? "tuer" : "fenster");
      const h = i.toDataURL("image/jpeg", 0.85).split(",")[1];
      this.plan = { bild: URL.createObjectURL(e), g: o, zuordnung: o.raeume.map(() => ""), art: l, massRaum: 0, massSeite: "breite", massM: 0, jpeg: h, name: t, strecke: [], streckeM: 0 };
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
    const n = this.data.raeume, s = e.g.raeume.map((l, h) => h).filter((l) => e.zuordnung[l]).map((l) => {
      const h = n.find((p) => p.id === e.zuordnung[l]), c = h.umriss.length >= 3 ? h.umriss : h.zonen.length ? [...h.zonen.flatMap((p) => C(p.form)), [h.sensor.x, h.sensor.y]] : [], d = Rt(e.g, l, t);
      let f = [0, 0];
      if (c.length) {
        const p = se(c), g = se(d.umriss);
        f = [Math.round((p.x0 + p.x1 - g.x0 - g.x1) / 2), Math.round((p.y0 + p.y1 - g.y0 - g.y1) / 2)];
      }
      return { i: l, raum: h, u: Rt(e.g, l, t, f) };
    }), i = n.filter((l) => l.haus_gesetzt && this.aufStockwerk(l) && !s.some((h) => h.raum.id === l.id)), r = (l) => se(l);
    let a = 0;
    if (i.length) {
      const l = r(i.flatMap((d) => this.outlineOf(d).map((f) => H(f, { x: d.haus_x, y: d.haus_y, winkel: d.haus_winkel })))), h = s.length ? r(s.flatMap((d) => d.u.umriss.map((f) => H(f, d.u.haus)))) : { x0: 0, y0: 0, x1: e.g.breite * t, y1: e.g.hoehe * t };
      h.x0 < l.x1 && h.x1 > l.x0 && h.y0 < l.y1 && h.y1 > l.y0 && (a = l.x1 + 200 - h.x0);
    }
    const o = s.map(({ i: l, raum: h, u: c }) => ({
      raum_id: h.id,
      ...this.stockwerk && !(h.stockwerke ?? []).length ? { stockwerke: [this.stockwerk] } : {},
      umriss: c.umriss,
      haus: { x: c.haus.x + a, y: c.haus.y, winkel: 0 },
      oeffnungen: c.luecken.filter((d) => e.art[d.luecke] !== "fenster").map((d) => {
        const f = e.g.luecken[d.luecke].partner, p = f !== null ? e.zuordnung[f] || "" : "aussen";
        return { kante: d.kante, von: d.von, bis: d.bis, art: e.art[d.luecke] === "offen" ? "offen" : "tuer", fuehrt_zu: p === h.id ? "" : p };
      })
    }));
    this.saving = !0;
    try {
      await this._hass.callWS({
        type: `${R}/plan/import`,
        raeume: o,
        plan: { name: e.name, mime: "image/jpeg", bild: e.jpeg, cm_pro_px: t, breite_px: e.g.breite, hoehe_px: e.g.hoehe, x: a, y: 0, stockwerk: this.stockwerk }
      }), this.planZu(), this.showToast(o.length ? `${o.length} ${o.length === 1 ? "Raum" : "Räume"} und der Grundriss übernommen.` : "Grundriss als Hintergrund übernommen."), await this.unsubscribeHaus(), await new Promise((l) => window.setTimeout(l, 1500)), await this.load(), this.viewTouched = !1, this.fit();
    } catch (l) {
      this.showToast(`Nicht übernommen: ${T(l)}`);
    } finally {
      this.saving = !1;
    }
  }
  async loadKandidaten() {
    if (!(!this._hass || !this.kannAendern))
      try {
        this.kandidaten = await this._hass.callWS({ type: `${R}/kandidaten/get` });
      } catch (e) {
        this.showToast(`Geräte nicht geladen: ${T(e)}`);
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
        this.showToast(`Nicht angelegt: ${T(t)}`);
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
        this.showToast(`Wege nicht geladen: ${T(e)}`);
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
          this.showToast(`Nicht umgewandelt: ${T(s)}`);
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
        this.showToast(`Nicht gelöscht: ${T(t)}`);
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
          t[i.id] = Gn(r.figuren.filter((a) => !a.hund).map((a) => a.abschnitte)), n = r.von, s = r.bis;
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
          const r = e.get(i), a = this.tueren[i] ?? t(r), o = a.startsWith("tuer:") ? a.slice(5) : "", h = { fuehrt_zu: (o ? o.split("/")[0] : a) || null, gegenstueck: o || null };
          return r.oeffnung !== void 0 ? { raum_id: r.raumId, oeffnung: r.oeffnung, ...h, ...i in this.tuerNamen ? { name: this.tuerNamen[i] } : {} } : { raum_id: r.raumId, zone_id: r.zoneId, ...h };
        });
        await this._hass.callWS({
          type: `${R}/haus/save`,
          raeume: Object.entries(this.lagen).map(([i, r]) => ({ raum_id: i, x: Math.round(r.x), y: Math.round(r.y), winkel: r.winkel, ...this.hausExtra[i] ?? {} })),
          plaene: Object.entries(this.planAenderung).map(([i, r]) => ({ plan_id: i, x: Math.round(r.x), y: Math.round(r.y), winkel: r.winkel, zuschnitt: r.zuschnitt, cm_pro_px: r.cm_pro_px, stockwerk: r.stockwerk || null })),
          tueren: s
        }), this.dirty = !1, this.hausExtra = {}, this.planAenderung = {}, this.tuerNamen = {}, this.planEdit = "", this.showToast("Hausplan gespeichert."), await this.unsubscribeHaus(), await new Promise((i) => window.setTimeout(i, 1500)), await this.load();
      } catch (e) {
        this.showToast(`Nicht gespeichert: ${T(e)}`);
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
    t && this.resize && t !== this.beobachtet && (this.resize.disconnect(), this.resize = void 0, this.viewTouched = !1), t && !this.resize && (this.beobachtet = t, this.resize = new ResizeObserver((n) => {
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
    return It(e.map((t) => this.toScreen(t)));
  }
  toWorld(e) {
    const n = this.renderRoot.querySelector("svg.plan")?.getBoundingClientRect() ?? { left: 0, top: 0 }, { cx: s, cy: i, scale: r } = this.view, [a, o] = P([(e.clientX - n.left - this.size.w / 2) / r, -(e.clientY - n.top - this.size.h / 2) / r], -this.ansichtWinkel);
    return [s + a, i + o];
  }
  snapped(e) {
    return yn(e, us);
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
    n[e] = wt(n[e], t, this.data.vorlagen), this.zones = n, this.dirty = !0;
  }
  addZone(e) {
    if (!this.data) return;
    this.remember();
    const t = ft(e, this.zones, this.data.vorlagen);
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
    const [e, t] = Ae(this.sensor.winkel), n = 46 / this.view.scale;
    return [this.sensor.x + e * n, this.sensor.y + t * n];
  }
  near(e, t, n = Z) {
    return Ce(this.toScreen(e), this.toScreen(t)) <= n;
  }
  zoneAt(e) {
    for (let t = this.zones.length - 1; t >= 0; t--) if (De(e, this.zones[t].form)) return t;
    return -1;
  }
  onPointerDown(e) {
    if (e.button === 2) return;
    this.layersOpen = !1;
    const t = e.currentTarget, n = this.toWorld(e), s = this.snapped(n);
    if (t.setPointerCapture(e.pointerId), this.wizWaehlt) {
      this.wizStelle(n);
      return;
    }
    if (this.handyAktiv) {
      this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }
    if (this.page === "haus" && this.planEdit && this.planMessen && this.planMessen.punkte.length < 2) {
      this.planMessen = { ...this.planMessen, punkte: [...this.planMessen.punkte, n] };
      return;
    }
    if (this.page === "haus" && this.planEdit) {
      const h = this.data?.plaene?.find((c) => c.id === this.planEdit);
      if (h && this.kannAendern) {
        const [c, d, f, p] = this.planZuschnitt(h), b = [
          [c, d],
          [f, d],
          [f, p],
          [c, p]
        ].findIndex(([_, z]) => this.near(n, this.planZuHaus(h, _, z), Z + 4));
        if (b >= 0) {
          this.drag = { kind: "plan-crop", id: h.id, ecke: b };
          return;
        }
        const [$, k] = this.hausZuPlan(h, n);
        if ($ >= c && $ <= f && k >= d && k <= p) {
          this.drag = { kind: "plan-move", id: h.id, last: n };
          return;
        }
      }
    }
    if (this.page === "haus") {
      const h = this.hausRoomAt(n);
      this.hausSel = h, h && this.kannAendern ? this.drag = { kind: "haus-raum", id: h, last: n } : this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }
    if (!this.kannAendern) {
      const h = this.zoneAt(n);
      this.select(h), h < 0 && (this.sensorOpen = !1, this.drag = { kind: "pan", start: [e.clientX, e.clientY], view: { cx: this.view.cx, cy: this.view.cy } });
      return;
    }
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft.length >= 3 && this.near(n, this.draft[0]) ? this.finishDraft() : this.draft = [...this.draft, s];
      return;
    }
    if (this.tool === "oeffnung") {
      const h = this.wallAt(n, Z * 2);
      if (h < 0) {
        this.showToast(this.umriss.length >= 3 ? "Bitte direkt auf einer Wand beginnen." : "Zuerst die Wände zeichnen.");
        return;
      }
      this.drag = { kind: "opening", kante: h, start: n }, this.openingDraft = null;
      return;
    }
    if (this.tool === "rechteck") {
      this.drag = { kind: "rect", start: s }, this.rectDraft = [s, s];
      return;
    }
    if (this.tool === "zellen") {
      let h = this.selected;
      h < 0 || this.zones[h].form.art !== "zellen" ? (this.addZone({ art: "zellen", groesse: xn, zellen: [] }), h = this.zones.length - 1) : this.remember();
      const c = this.zones[h].form, [d, f] = nt(n, c.groesse, c.x0 ?? 0, c.y0 ?? 0), p = !c.zellen.some(([g, b]) => g === d && b === f);
      this.drag = { kind: "paint", add: p }, this.updateZone(h, { form: bt(c, n, p) });
      return;
    }
    if (this.istMelder) {
      for (const [h, c] of Object.entries(this.melderLagen))
        if (this.melder.includes(h)) {
          if (this.near(n, this.melderGriff(c), Z + 2)) {
            this.remember(), this.drag = { kind: "melder-rotate", key: h };
            return;
          }
          if (this.near(n, [c.x, c.y], Z + 4)) {
            this.remember(), this.drag = { kind: "melder", key: h };
            return;
          }
        }
    }
    const i = this.oeffnungen[this.selOpening];
    if (i && this.umriss.length >= 3) {
      const [h, c] = ce(this.umriss, i);
      for (const [d, f] of [["von", h], ["bis", c]])
        if (this.near(n, f, Z + 4)) {
          this.remember(), this.drag = { kind: "opening-end", index: this.selOpening, ende: d };
          return;
        }
    }
    const r = this.openingAt(n);
    if (r >= 0 && r === this.selOpening) {
      const h = this.oeffnungen[r];
      this.remember(), this.drag = { kind: "opening-move", index: r, start: ge(this.umriss, h.kante, n), von: h.von, bis: h.bis };
      return;
    }
    const a = this.zones[this.selected];
    if (a && a.form.art !== "zellen" && this.near(n, this.zoneRotateHandle(a.form))) {
      this.remember();
      const h = E(a.form);
      this.drag = { kind: "rotate-zone", center: h, start: ye(h, n), anchor: a.form };
      return;
    }
    if (a?.form.art === "vieleck") {
      const h = a.form.punkte.findIndex((d) => this.near(n, d));
      if (h >= 0) {
        if (this.remember(), e.altKey) {
          this.deleteVertex(this.selected, h);
          return;
        }
        this.selVertex = h, this.drag = { kind: "vertex", index: h };
        return;
      }
      const c = te(a.form.punkte).findIndex((d) => this.near(n, d));
      if (c >= 0) {
        this.remember(), this.updateZone(this.selected, { form: gt(a.form, c, this.snapped(te(a.form.punkte)[c])) }), this.selVertex = c + 1, this.drag = { kind: "vertex", index: c + 1 };
        return;
      }
    } else if (a?.form.art === "rechteck") {
      const h = a.form, c = Me(h.mitte, h.breite, h.tiefe, h.winkel).findIndex((d) => this.near(n, d));
      if (c >= 0) {
        this.remember(), this.drag = { kind: "corner", index: c };
        return;
      }
    }
    if (!this.istMelder && this.near(n, this.sensorHandle(), Z + 2)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor-rotate" }, this.openSensor();
      return;
    }
    if (!this.istMelder && this.near(n, [this.sensor.x, this.sensor.y], Z + 4)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor" }, this.openSensor();
      return;
    }
    const o = this.zoneAt(n);
    if (o >= 0) {
      this.select(o), this.remember(), this.drag = { kind: "zone", last: s };
      return;
    }
    const l = this.umriss.findIndex((h) => this.near(n, h));
    if (l >= 0) {
      this.remember(), this.drag = { kind: "umriss-vertex", index: l };
      return;
    }
    if (this.umriss.length >= 3) {
      const h = te(this.umriss).findIndex((d) => this.near(n, d));
      if (h >= 0) {
        this.remember();
        const d = this.umriss.slice();
        d.splice(h + 1, 0, this.snapped(te(this.umriss)[h])), this.oeffnungen = zt(this.oeffnungen, { inserted: h }, this.umriss.length), this.umriss = d, this.dirty = !0, this.drag = { kind: "umriss-vertex", index: h + 1 };
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
      this.remember(), this.updateZone(e, { form: Hn(n.form, t) }), this.selVertex = -1;
    }
  }
  deleteWallCorner(e) {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember(), this.oeffnungen = zt(this.oeffnungen, { removed: e }, this.umriss.length), this.umriss = this.umriss.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0;
  }
  changeOpening(e, t) {
    this.remember(), this.oeffnungen = this.oeffnungen.map((n, s) => s === e ? { ...n, ...t } : n), this.dirty = !0;
  }
  deleteOpening(e) {
    confirm("Diese Öffnung in der Wand löschen?") && (this.remember(), this.oeffnungen = this.oeffnungen.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0);
  }
  turnZone(e, t) {
    const n = this.zones[e];
    !n || n.form.art === "zellen" || (this.remember(), this.updateZone(e, { form: yt(n.form, E(n.form), t) }));
  }
  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  wallAt(e, t = Z) {
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
      return Oe(this.toScreen(e), this.toScreen(n), this.toScreen(s)) <= Z;
    });
  }
  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  zoneRotateHandle(e) {
    const t = E(e), n = Math.max(...C(e).map((s) => s[1]));
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
        i && this.updateZone(this.selected, { form: Ln(i.form, s.index, n) });
        break;
      case "corner":
        i?.form.art === "rechteck" && this.updateZone(this.selected, { form: In(i.form, s.index, n) });
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
          this.updateZone(this.selected, { form: Ve(i.form, l * o, h * o) }), this.drag = { kind: "zone", last: [s.last[0] + l * o, s.last[1] + h * o] };
        } else (r || a) && (this.updateZone(this.selected, { form: Ve(i.form, r, a) }), this.drag = { kind: "zone", last: n });
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: n[0], y: n[1] });
        break;
      case "sensor-rotate": {
        let r = ye([this.sensor.x, this.sensor.y], t);
        e.shiftKey || (r = Math.round(r / 5) * 5), r <= -180 && (r += 360), this.moveSensor({ ...this.sensor, winkel: r });
        break;
      }
      case "paint":
        i?.form.art === "zellen" && this.updateZone(this.selected, { form: bt(i.form, t, s.add) });
        break;
      case "rect":
        this.rectDraft = [s.start, n];
        break;
      case "opening": {
        this.openingDraft = On(this.umriss, s.kante, s.start, t);
        break;
      }
      case "plan-move": {
        const r = this.data?.plaene?.find((h) => h.id === s.id);
        if (!r) break;
        const a = Math.round((t[0] - s.last[0]) / 5) * 5, o = Math.round((t[1] - s.last[1]) / 5) * 5;
        if (!a && !o) break;
        const l = this.planLage(r);
        this.planAendern(r, { x: l.x + a, y: l.y + o }), this.drag = { ...s, last: [s.last[0] + a, s.last[1] + o] };
        break;
      }
      case "plan-crop": {
        const r = this.data?.plaene?.find((b) => b.id === s.id);
        if (!r) break;
        const [a, o] = this.hausZuPlan(r, t);
        let [l, h, c, d] = this.planZuschnitt(r);
        const f = Math.max(0, Math.min(r.breite_px, a)), p = Math.max(0, Math.min(r.hoehe_px, o)), g = 20;
        s.ecke === 0 || s.ecke === 3 ? l = Math.min(f, c - g) : c = Math.max(f, l + g), s.ecke === 0 || s.ecke === 1 ? h = Math.min(p, d - g) : d = Math.max(p, h + g), this.planAendern(r, { zuschnitt: [l, h, c, d].map((b) => Math.round(b)) });
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
        let a = ye([r.x, r.y], t);
        e.shiftKey || (a = Math.round(a / 5) * 5), a <= -180 && (a += 360), this.melderLagen = { ...this.melderLagen, [s.key]: { ...r, winkel: a } }, this.dirty = !0;
        break;
      }
      case "opening-end": {
        const r = this.oeffnungen[s.index];
        if (!r) break;
        const a = Ht(this.umriss, r.kante), o = Math.max(0, Math.min(Math.floor(a), Math.round(ge(this.umriss, r.kante, t) / 5) * 5)), l = s.ende === "von" ? { ...r, von: Math.min(o, r.bis - 20) } : { ...r, bis: Math.max(o, r.von + 20) };
        this.oeffnungen = this.oeffnungen.map((h, c) => c === s.index ? l : h), this.dirty = !0;
        break;
      }
      case "opening-move": {
        const r = this.oeffnungen[s.index];
        if (!r) break;
        const a = Math.floor(Ht(this.umriss, r.kante)), o = s.bis - s.von;
        let l = Math.round((s.von + ge(this.umriss, r.kante, t) - s.start) / 5) * 5;
        l = Math.max(0, Math.min(a - o, l)), l !== r.von && (this.oeffnungen = this.oeffnungen.map((h, c) => c === s.index ? { ...r, von: l, bis: l + o } : h), this.dirty = !0);
        break;
      }
      case "rotate-zone": {
        let r = ye(s.center, t) - s.start;
        e.shiftKey || (r = Math.round(r / 5) * 5), this.updateZone(this.selected, { form: yt(s.anchor, s.center, r) });
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
    this.zonesFollow && t && (this.zones = t.zones.map((n) => ({ ...n, form: Sn(n.form, t.sensor, e) }))), this.dirty = !0;
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
        const i = Ee(this.umriss, t), r = i && this.data ? We(this.data.raeume, this.raumId, i) : null;
        r && (t.gegenstueck = r.tuer.key, t.fuehrt_zu = r.tuer.raumId, this.showToast(`Verbunden mit ${this.tuerText(r.tuer)}. Ändern unter „Führt zu“.`)), this.oeffnungen = [...this.oeffnungen, t], this.selOpening = this.oeffnungen.length - 1, this.selected = -1, this.openTab("raum"), this.dirty = !0, this.tool = "auswahl";
      } else
        this.showToast("Etwas weiter an der Wand entlang ziehen (mindestens 20 cm).");
      return;
    }
    if (e?.kind === "rect" && this.rectDraft) {
      const [t, n] = this.rectDraft;
      this.rectDraft = null, Math.abs(t[0] - n[0]) >= 10 && Math.abs(t[1] - n[1]) >= 10 && (this.addZone($t(t, n)), this.tool = "auswahl");
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
      if (Oe(this.toScreen(n), this.toScreen(s[i]), this.toScreen(s[(i + 1) % s.length])) <= Z) {
        this.remember(), this.updateZone(this.selected, { form: gt(t.form, i, this.snapped(n)) });
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
      const h = Math.hypot(e, t) / 2 / n, { cx: c, cy: d } = this.view, f = (p, g, b) => {
        const [$, k] = this.toScreen(p), [_, z] = this.toScreen(g);
        return w`<line class="grid ${b ? "major" : ""}" x1=${$} y1=${k} x2=${_} y2=${z} />`;
      };
      for (let p = Math.floor((c - h) / s) * s; p <= c + h; p += s) i.push(f([p, d - h], [p, d + h], p % 100 === 0));
      for (let p = Math.floor((d - h) / s) * s; p <= d + h; p += s) i.push(f([c - h, p], [c + h, p], p % 100 === 0));
      return w`<g>${i}</g>`;
    }
    const r = this.view.cx - e / 2 / n, a = this.view.cx + e / 2 / n, o = this.view.cy - t / 2 / n, l = this.view.cy + t / 2 / n;
    for (let h = Math.floor(r / s) * s; h <= a; h += s) {
      const [c] = this.toScreen([h, 0]);
      i.push(w`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1=${c} y1="0" x2=${c} y2=${t} />`);
    }
    for (let h = Math.floor(o / s) * s; h <= l; h += s) {
      const [, c] = this.toScreen([0, h]);
      i.push(w`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1="0" y1=${c} x2=${e} y2=${c} />`);
    }
    return w`<g>${i}</g>`;
  }
  renderRoom() {
    if (this.umriss.length < 3) return m;
    const e = this.screenPoints(this.umriss), t = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen, n = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen, s = E({ art: "vieleck", punkte: this.umriss }), i = this.istMelder && !!this.live?.zonen[F]?.belegt;
    return w`<polygon class="floor ${i ? "belegt" : ""}" points=${e} />
      <polygon class="wall" points=${e} />
      ${n.map((r, a) => this.renderOpening(r, a === this.selOpening || r === this.openingDraft, s))}
      ${this.kannAendern && this.tool === "auswahl" && this.oeffnungen[this.selOpening] ? ce(this.umriss, this.oeffnungen[this.selOpening]).map((r) => {
      const [a, o] = this.toScreen(r);
      return w`<circle class="handle opening-griff" cx=${a} cy=${o} r="8" />`;
    }) : m}
      ${t ? w`${this.umriss.map((r) => {
      const [a, o] = this.toScreen(r);
      return w`<circle class="handle" cx=${a} cy=${o} r="5" />`;
    })}
          ${te(this.umriss).map((r) => this.renderPlus(r))}` : m}`;
  }
  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  renderOpening(e, t, n) {
    const [s, i] = ce(this.umriss, e), [r, a] = this.toScreen(s), [o, l] = this.toScreen(i), h = w`<line class="wall-gap" x1=${r} y1=${a} x2=${o} y2=${l} />`;
    if (e.art === "offen")
      return w`<g class="opening ${t ? "selected" : ""}">${h}<line class="opening-line" x1=${r} y1=${a} x2=${o} y2=${l} /></g>`;
    const [c, d, f, p] = e.anschlag === "ende" ? [o, l, r, a] : [r, a, o, l], g = Math.hypot(f - c, p - d) || 1;
    let b = -(p - d) / g, $ = (f - c) / g;
    const [k, _] = this.toScreen(n);
    (k - c) * b + (_ - d) * $ >= 0 !== (e.aufgehen !== "aussen") && (b = -b, $ = -$);
    const M = c + b * g, S = d + $ * g, A = (f - c) * $ - (p - d) * b > 0 ? 0 : 1;
    return w`<g class="opening ${t ? "selected" : ""}">${h}
      <line class="door-leaf" x1=${c} y1=${d} x2=${M} y2=${S} />
      <path class="door-arc" d="M ${M} ${S} A ${g} ${g} 0 0 ${A} ${f} ${p}" /></g>`;
  }
  /** Kleines „+“: hier einen Punkt einfügen. */
  renderPlus(e) {
    const [t, n] = this.toScreen(e);
    return w`<g class="plus"><circle cx=${t} cy=${n} r="6" /><path d="M ${t - 3} ${n} H ${t + 3} M ${t} ${n - 3} V ${n + 3}" /></g>`;
  }
  /** Zellen, die gerade als Bewegungskarte gezeigt werden. */
  heatQuelle() {
    if (this.istMelder) return null;
    if (this.tab === "auswertung" && this.ausw) {
      const e = this.ausw, t = this.auswFigur ? e.figuren.filter((n) => n.figur === this.auswFigur) : e.figuren;
      return { key: `a|${e.bis}|${e.stunden}|${this.auswFigur}`, zellen: At(t.map((n) => n.zellen)), zelle: e.zelle_cm, sigma: 8 };
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
      const i = Mt(e.zellen, e.zelle, e.sigma);
      if (!i) return m;
      const r = document.createElement("canvas");
      r.width = i.nx, r.height = i.ny;
      const a = r.getContext("2d");
      if (!a) return m;
      a.putImageData(new ImageData(Cn(i, this.heatRgb()), i.nx, i.ny), 0, 0), t = { key: e.key, href: r.toDataURL(), x0: i.x0, y0: i.y0, w: i.nx * i.zelle, h: i.ny * i.zelle }, this.heatBildCache = t;
    }
    const [n, s] = this.toScreen([t.x0, t.y0 + t.h]);
    return w`<image class="heat" href=${t.href} x=${n} y=${s} width=${this.px(t.w)} height=${this.px(t.h)} preserveAspectRatio="none" />`;
  }
  /** Stellen des Assistenten als 1, 2, 3 im Plan; dazu die neue Lage des Sensors. */
  renderWizMarken() {
    const e = this.wiz;
    if (!e) return m;
    const t = e.raum.map((r, a) => {
      if (!r) return m;
      const [o, l] = this.toScreen(r), h = a === e.aktiv && e.schritt === "nachher";
      return w`<g class="wiz-marke ${h ? "aktiv" : ""}"><circle cx=${o} cy=${l} r="14" /><text x=${o} y=${l + 5}>${a + 1}</text></g>`;
    });
    let n = m;
    if (this.wizWaehlt) {
      const r = this.wizAnker(), a = new Set(St(r));
      n = w`${r.map((o, l) => {
        const [h, c] = this.toScreen(o.punkt);
        return e.raum.some((f) => f && f[0] === o.punkt[0] && f[1] === o.punkt[1]) ? m : w`<g class="wiz-anker ${a.has(l) ? "vorschlag" : ""}"><circle cx=${h} cy=${c} r="16" /><text x=${h} y=${c + 5}>${String.fromCharCode(65 + l)}</text></g>`;
      })}`;
    }
    const s = e.ergebnis;
    let i = m;
    if (s) {
      const [r, a] = this.toScreen([s.x, s.y]), o = Math.max(30, this.px(80)), [l, h] = Ae(s.winkel);
      i = w`<g class="wiz-neu"><circle cx=${r} cy=${a} r="9" /><line x1=${r} y1=${a} x2=${r + l * o} y2=${a - h * o} /></g>`;
    }
    return w`${n}${t}${i}`;
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
    const s = this.planLage(e), i = Math.max(0.01, Math.min(100, s.cm_pro_px * t)), [r, a, o, l] = this.planZuschnitt(e), h = n ?? this.planZuHaus(e, (r + o) / 2, (a + l) / 2), [c, d] = this.hausZuPlan(e, h);
    this.planAendern(e, { cm_pro_px: i });
    const f = this.planZuHaus(e, c, d), p = this.planLage(e);
    this.planAendern(e, { x: p.x + h[0] - f[0], y: p.y + h[1] - f[1] });
  }
  planAendern(e, t) {
    this.planAenderung = { ...this.planAenderung, [e.id]: { ...this.planLage(e), ...t } }, this.dirty = !0;
  }
  planDrehen(e, t) {
    const [n, s, i, r] = this.planZuschnitt(e), a = this.planZuHaus(e, (n + i) / 2, (s + r) / 2);
    let l = ((this.planLage(e).winkel + t) % 360 + 540) % 360 - 180;
    l === -180 && (l = 180), this.planAendern(e, { winkel: l });
    const h = this.planZuHaus(e, (n + i) / 2, (s + r) / 2), c = this.planLage(e);
    this.planAendern(e, { x: c.x + a[0] - h[0], y: c.y + a[1] - h[1] });
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
      n = (r) => Rn(r, i);
    }
    return w`${e.map((s) => {
      const i = ($, k) => {
        const _ = this.planZuHaus(s, $, k);
        return this.toScreen(n ? n(_) : _);
      }, [r, a, o] = [i(0, 0), i(1, 0), i(0, 1)], l = [a[0] - r[0], a[1] - r[1], o[0] - r[0], o[1] - r[1], r[0], r[1]].map(($) => $.toFixed(5)).join(" "), [h, c, d, f] = this.planZuschnitt(s), p = this.page === "haus" && this.planEdit === s.id, g = p ? [
        [h, c],
        [d, c],
        [d, f],
        [h, f]
      ].map(([$, k]) => {
        const [_, z] = i($, k);
        return w`<circle class="handle plan-griff" cx=${_} cy=${z} r="9" />`;
      }) : m, b = p ? w`<polygon class="plan-rahmen" points=${It([i(h, c), i(d, c), i(d, f), i(h, f)])} />` : m;
      return w`<g transform="matrix(${l})">
          <clipPath id=${`zuschnitt-${s.id}`}><rect x=${h} y=${c} width=${d - h} height=${f - c} /></clipPath>
          <image class="plan-hintergrund ${p ? "edit" : ""}" href=${this.planBilder[s.id]} x="0" y="0" width=${s.breite_px} height=${s.hoehe_px} preserveAspectRatio="none" clip-path=${`url(#zuschnitt-${s.id})`} />
        </g>
        ${b}${g}`;
    })}`;
  }
  /** Maße der Wände (und Öffnungen), wenn eingeschaltet. */
  renderMasse() {
    if (!this.masse || this.umriss.length < 3) return m;
    const e = this.umriss.length, t = E({ art: "vieleck", punkte: this.umriss }), n = this.umriss.map((i, r) => {
      const a = this.umriss[(r + 1) % e], o = Math.hypot(a[0] - i[0], a[1] - i[1]);
      if (o < 20) return m;
      const l = [(i[0] + a[0]) / 2, (i[1] + a[1]) / 2];
      let h = -(a[1] - i[1]) / o, c = (a[0] - i[0]) / o;
      (t[0] - l[0]) * h + (t[1] - l[1]) * c > 0 && ([h, c] = [-h, -c]);
      const [d, f] = this.toScreen(l), p = 26, [g, b] = [d + h * p, f - c * p];
      return w`<text class="mass-text" x=${g} y=${b} dy="0.35em">${Zt(o)} m</text>`;
    }), s = this.oeffnungen.map((i) => {
      const [r, a] = ce(this.umriss, i), [o, l] = this.toScreen([(r[0] + a[0]) / 2, (r[1] + a[1]) / 2]);
      return w`<text class="mass-text klein" x=${o} y=${l} dy="-0.8em">${Zt(i.bis - i.von)}</text>`;
    });
    return w`<g>${n}${s}</g>`;
  }
  melderPlatzieren(e) {
    this.remember();
    const t = this.umriss.length >= 3 ? E({ art: "vieleck", punkte: this.umriss }) : [0, 0], n = Object.keys(this.melderLagen).length;
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
      ${this.umriss.length >= 3 ? u`<p class="hint small">
            <b>Reichweite laut Plan: ${(Math.max(...this.umriss.map((s) => Math.hypot(s[0] - t.x, s[1] - t.y))) / 100).toFixed(1).replace(".", ",")} m</b>
            (weitester Punkt des Raums von hier). Hat der Melder eine einstellbare Reichweite („Maximum range“), am Gerät etwa so viel plus 20 cm einstellen; dann sieht er nicht durch die Wand in den Nachbarraum.
          </p>` : m}
    </div>`;
  }
  melderGriff(e) {
    const [t, n] = Ae(e.winkel), s = 40 / this.view.scale;
    return [e.x + t * s, e.y + n * s];
  }
  /** Melder im Plan: Punkt mit Sichtbereich, ziehen und am Griff drehen. */
  renderMelderLagen() {
    const e = Object.entries(this.melderLagen).filter(([t]) => this.melder.includes(t));
    return e.length ? w`${e.map(([t, n]) => {
      const [s, i] = this.toScreen([n.x, n.y]), [r, a] = this.toScreen(this.melderGriff(n));
      return w`<g class="melder-lage">
        <polygon class="coverage" points=${this.screenPoints(Ne([n.x, n.y], n.winkel, n.reichweite_cm, n.oeffnung_grad))} />
        ${this.kannAendern && n.oeffnung_grad < 360 ? w`<line class="sensor-line" x1=${s} y1=${i} x2=${r} y2=${a} /><circle class="handle angle" cx=${r} cy=${a} r="7" />` : m}
        <circle class="melder-punkt" cx=${s} cy=${i} r="9" />
        <text class="label sub" x=${s} y=${i + 24}>${this.melderName(t)}</text>
      </g>`;
    })}` : m;
  }
  /** Melder-Raum: in der Mitte steht, ob jemand da ist. */
  renderMelderLabel() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[F]?.belegt, s = this.umriss.length >= 3 ? E({ art: "vieleck", punkte: this.umriss }) : [0, 0], [i, r] = this.toScreen(s);
    return w`<text class="label room" x=${i} y=${r}>${t ? n ? "jemand da" : "niemand" : "Melder nicht erreichbar"}</text>
      ${this.umriss.length < 3 ? w`<text class="label sub" x=${i} y=${r + 18}>Wände zeichnen: Werkzeug links</text>` : m}`;
  }
  renderCoverage() {
    if (!this.layers.abdeckung) return m;
    const e = this.sensor;
    return w`<polygon class="coverage" points=${this.screenPoints(Ne([e.x, e.y], e.winkel, e.reichweite_cm, e.oeffnung_grad))} />`;
  }
  renderZone(e, t) {
    const n = (e.id ? this.live?.zonen[e.id]?.belegt : !1) ?? !1, s = he(e), i = de(s), r = t === this.selected, a = n ? 0.5 : 0.2;
    let o;
    if (e.form.art === "zellen")
      o = w`${tt(e.form).map((l) => {
        const h = [
          [l.x, l.y],
          [l.x + l.s, l.y],
          [l.x + l.s, l.y + l.s],
          [l.x, l.y + l.s]
        ];
        return w`<polygon class="zone-shape ${r ? "selected" : ""}" points=${this.screenPoints(h)} fill=${i} fill-opacity=${a} stroke=${i} style="stroke-width:1" />`;
      })}`;
    else {
      const l = this.screenPoints(C(e.form)), h = r && e.regel.rand_cm > 0 ? this.px(e.regel.rand_cm * 2) : 0;
      o = w`
        ${h ? w`<mask id="rz-band-${t}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${l} fill="black" />
              </mask>
              <polygon points=${l} fill="none" stroke=${i} stroke-opacity="0.25" stroke-width=${h} stroke-linejoin="round" mask="url(#rz-band-${t})" />` : m}
        <polygon class="zone-shape ${r ? "selected" : ""}" points=${l} fill=${i} fill-opacity=${a} stroke=${i} />`;
    }
    return w`<g>${o}</g>`;
  }
  /** Beschriftung der Zone; wird nach den Figuren gezeichnet, damit sie lesbar bleibt. */
  renderZoneLabel(e) {
    const t = e.id ? this.live?.zonen[e.id] : void 0, [n, s] = this.toScreen(E(e.form)), i = t ? t.belegt ? `belegt${t.personen > 1 ? ` · ${t.personen}` : ""}` : "frei" : "neu";
    return w`<text class="label" x=${n} y=${s - 2}>${e.name}</text>
      <text class="label sub" x=${n} y=${s + 14}>${i}</text>`;
  }
  renderHandles() {
    const e = this.zones[this.selected];
    if (!e || this.tool !== "auswahl" || !this.kannAendern) return m;
    let t = [];
    e.form.art === "vieleck" ? t = e.form.punkte : e.form.art === "rechteck" && (t = Me(e.form.mitte, e.form.breite, e.form.tiefe, e.form.winkel));
    let n = m;
    if (e.form.art !== "zellen") {
      const [s, i] = this.toScreen(E(e.form)), [r, a] = this.toScreen(this.zoneRotateHandle(e.form));
      n = w`<line class="sensor-line" x1=${s} y1=${i} x2=${r} y2=${a} /><circle class="handle angle" cx=${r} cy=${a} r="8"><title>Drehen</title></circle>`;
    }
    return w`${n}
      ${e.form.art === "vieleck" ? te(e.form.punkte).map((s) => this.renderPlus(s)) : m}
      ${t.map((s, i) => {
      const [r, a] = this.toScreen(s), o = e.form.art === "vieleck" && i === this.selVertex;
      return w`<rect class="handle ${o ? "on" : ""}" x=${r - 5} y=${a - 5} width="10" height="10" rx="2" />`;
    })}`;
  }
  renderSensor() {
    const e = this.sensor, [t, n] = this.toScreen([e.x, e.y]), [s, i] = this.toScreen(this.sensorHandle()), r = -e.winkel * Math.PI / 180, a = [4.5, 7.5].map((o) => {
      const l = r - Math.PI / 2 - 0.7, h = r - Math.PI / 2 + 0.7;
      return w`<path class="sensor-wave" d="M ${t + o * Math.cos(l)} ${n + o * Math.sin(l)} A ${o} ${o} 0 0 1 ${t + o * Math.cos(h)} ${n + o * Math.sin(h)}" />`;
    });
    return w`<g>
      ${this.kannAendern ? w`<line class="sensor-line" x1=${t} y1=${n} x2=${s} y2=${i} />
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
        t.push(w`<path class="target" d="M${i - 4} ${r - 4} L${i + 4} ${r + 4} M${i - 4} ${r + 4} L${i + 4} ${r - 4}" />`);
      }
    for (const n of e.figuren) {
      if (n.tags.includes("wiederhergestellt") || n.tags.includes("stoerung")) continue;
      const s = n.markierung === "hund" || n.tags.includes("hund") || n.art === "pet", i = s ? "var(--rz-tier)" : "var(--rz-person)";
      if (this.layers.spuren && n.spur.length > 1 && t.push(w`<polyline class="trail" points=${this.screenPoints(n.spur)} stroke=${i} />`), !this.layers.figuren) continue;
      const [r, a] = this.toScreen([n.x, n.y]), o = Math.max(7, this.px(14));
      t.push(w`<circle class="figure ${n.gehalten ? "held" : ""}" cx=${r} cy=${a} r=${o} fill=${i} stroke=${n.gehalten ? i : "var(--card)"} />`), this.wiz && t.push(w`<text class="figure-nr" x=${r} y=${a + 4}>${n.id}</text>`);
      const l = n.markierung === "ich" ? "Ich" : n.markierung === "hund" ? "Hund" : s ? "Hund?" : n.gehalten ? "gehalten" : "";
      l && t.push(w`<text class="label sub" x=${r} y=${a - o - 5}>${l}${n.markierung !== "ich" && n.gehalten && s ? " (gehalten)" : ""}</text>`);
    }
    return w`<g>${t}</g>`;
  }
  renderDraft() {
    if (this.rectDraft) {
      const s = $t(...this.rectDraft);
      if (s.art !== "rechteck") return m;
      const [i, r] = this.toScreen(s.mitte);
      return w`<polygon class="draft" points=${this.screenPoints(Me(s.mitte, s.breite, s.tiefe, 0))} />
        <text class="label" x=${i} y=${r + 5}>${(s.breite / 100).toFixed(2)} × ${(s.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return m;
    const e = this.hover ? [...this.draft, this.hover] : this.draft, [t, n] = this.toScreen(this.draft[0]);
    return w`<polyline class="draft" points=${this.screenPoints(e)} style="fill:none" />
      ${this.draft.map((s) => {
      const [i, r] = this.toScreen(s);
      return w`<circle class="draft-dot" cx=${i} cy=${r} r="4" />`;
    })}
      ${this.draft.length >= 3 ? w`<circle class="close-ring" cx=${t} cy=${n} r=${Z} />` : m}`;
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
      if (i && De(e, { art: "vieleck", punkte: this.outlineOf(s).map((r) => H(r, i)) })) return s.id;
    }
    return "";
  }
  /** Mitte einer Tür im Haus. */
  renderHausPlan() {
    const e = this.hausRaeume(), t = [], n = [], s = [], i = [];
    for (const o of e) {
      const l = this.lagen[o.id];
      if (!l) continue;
      const h = this.outlineOf(o).map((k) => H(k, l)), c = o.id === this.hausSel, d = this.hausLive[o.id], f = o.art === "melder" && !!d?.zonen[F]?.belegt;
      t.push(w`<polygon class="floor ${f ? "belegt" : ""}" points=${this.screenPoints(h)} />
        <polygon class="wall ${o.umriss.length >= 3 ? "" : "guess"} ${c ? "selected" : ""}" points=${this.screenPoints(h)} />`);
      for (const k of o.zonen) {
        const _ = he(k);
        if (_ === "ignorieren") continue;
        const z = (k.id ? d?.zonen[k.id]?.belegt : !1) ?? !1, M = C(k.form).map((S) => H(S, l));
        t.push(w`<polygon class="zone-shape" points=${this.screenPoints(M)} fill=${de(_)} fill-opacity=${z ? 0.5 : 0.18} stroke=${de(_)} />`);
      }
      for (const k of N(o)) {
        const _ = this.tueren[k.key] ?? "", z = _.startsWith("tuer:") ? _.slice(5) : "", M = z ? z.split("/")[0] : _, [S, A] = this.toScreen(H(k.punkt, l));
        if (M === "aussen")
          s.push(w`<text class="label sub" x=${S} y=${A - 10}>nach draußen</text>`);
        else if (M) {
          const L = e.find((B) => B.id === M);
          if (!L) continue;
          const I = z ? N(L).find((B) => B.key === z) : N(L).find((B) => this.tueren[B.key] === o.id || this.tueren[B.key] === `tuer:${k.key}`);
          if (I && o.id > L.id) continue;
          const O = this.lagen[L.id];
          if (!O) continue;
          const ae = H(I ? I.punkt : E({ art: "vieleck", punkte: this.outlineOf(L) }), O), [Q, oe] = this.toScreen(ae);
          n.push(w`<line class="link" x1=${S} y1=${A} x2=${Q} y2=${oe} />
            <circle class="link-dot" cx=${S} cy=${A} r="5" /><circle class="link-dot" cx=${Q} cy=${oe} r="5" />`);
        }
      }
      const [p, g] = this.toScreen(E({ art: "vieleck", punkte: h })), b = d ? d.figuren.filter((k) => !k.tags.includes("wiederhergestellt") && !k.tags.includes("stoerung")).length : 0, $ = !d || d.problem || !d.verfuegbar ? "nicht erreichbar" : o.art === "melder" ? f ? "jemand da" : "niemand" : b ? `${b} ${b === 1 ? "Person" : "Personen"}` : "niemand";
      if (s.push(w`<text class="label room" x=${p} y=${g}>${o.name}</text>
        <text class="label sub" x=${p} y=${g + 16}>${$}</text>`), o.art !== "melder")
        for (const k of d?.figuren ?? []) {
          if (k.tags.includes("wiederhergestellt") || k.tags.includes("stoerung")) continue;
          const z = k.tags.includes("hund") || k.art === "pet" ? "var(--rz-tier)" : "var(--rz-person)", [M, S] = this.toScreen(H([k.x, k.y], l)), A = Math.max(6, this.px(14));
          i.push(w`<circle class="figure ${k.gehalten ? "held" : ""}" cx=${M} cy=${S} r=${A} fill=${z} stroke=${k.gehalten ? z : "var(--card)"} />`);
        }
    }
    const r = this.planMessen?.punkte ?? [], a = w`${r.length === 2 ? w`<line class="plan-strecke-linie" x1=${this.toScreen(r[0])[0]} y1=${this.toScreen(r[0])[1]} x2=${this.toScreen(r[1])[0]} y2=${this.toScreen(r[1])[1]} />` : m}${r.map((o) => {
      const [l, h] = this.toScreen(o);
      return w`<circle class="plan-strecke" cx=${l} cy=${h} r="6" />`;
    })}`;
    return w`${this.renderPlanBilder()}${t}${n}${i}${s}${a}`;
  }
  renderScalebar() {
    const e = fs(90 / this.view.scale), t = e >= 100 ? `${e / 100} m` : `${e} cm`;
    return u`<div class="scalebar"><div style="width:${this.px(e)}px"></div>${t}</div>`;
  }
  renderBubble() {
    const e = ms[this.tool];
    if (e) {
      const t = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return u`<div class="bubble">
        <ha-icon icon=${Lt.find((n) => n.tool === this.tool).icon}></ha-icon>
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
        ${this.page === "haus" ? this.renderHausPlan() : this.istMelder ? w`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderMelderLagen()}
              ${this.zones.map((t, n) => this.renderZone(t, n))} ${this.zones.map((t) => this.renderZoneLabel(t))}
              ${this.renderMelderLabel()} ${this.renderHandles()} ${this.renderDraft()}` : w`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((t, n) => this.renderZone(t, n))} ${this.renderLive()}
              ${this.zones.map((t) => this.renderZoneLabel(t))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()} ${this.renderWizMarken()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(t) => t.stopPropagation()}>
        ${this.kannAendern && this.page === "raum" ? u`${Lt.filter((t) => !this.istMelder || ps.includes(t.tool)).map(
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
      this.zeigePlan = !this.zeigePlan, je("raumzonen-zeige-plan", this.zeigePlan);
    }}
            >
              <ha-icon icon="mdi:image-outline"></ha-icon>
            </button>` : m}
        ${this.page === "raum" ? u`<button
              class="icon ${this.masse ? "on" : ""}"
              title="Maße der Wände"
              aria-label="Maße der Wände"
              @click=${() => {
      this.masse = !this.masse, je("raumzonen-masse", this.masse);
    }}
            >
              <ha-icon icon="mdi:ruler"></ha-icon>
            </button>` : m}
        ${this.page === "raum" && this.raum?.haus_gesetzt && Math.abs(this.raum.haus_winkel ?? 0) > 0.01 ? u`<button
              class="icon ${this.wieImHaus ? "on" : ""}"
              title=${this.wieImHaus ? "Ansicht wie im Hausplan (tippen: Raum gerade)" : "Raum gerade (tippen: wie im Hausplan)"}
              aria-label="Ansicht drehen"
              @click=${() => {
      this.wieImHaus = !this.wieImHaus, je("raumzonen-wie-im-haus", this.wieImHaus), this.viewTouched = !1, this.fit();
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
    const n = t === this.selected, s = he(e), i = Se(s), r = e.id ? this.live?.zonen[e.id] : void 0, a = r ? u`<span class="badge ${r.belegt ? "on" : "off"}">${r.belegt ? r.personen > 1 ? `belegt · ${r.personen}` : "belegt" : "frei"}</span>` : u`<span class="badge new">neu</span>`;
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
    const n = e.regel, s = he(e), i = this.data.grenzen, r = (c, d, f, p, g) => u`<label class="field"
        >${d}<input
          type="number"
          min="0"
          max=${p}
          step=${g}
          .value=${String(n[c])}
          @change=${(b) => {
      const $ = Number(b.target.value);
      Number.isFinite($) && this.updateRegel(t, { [c]: Math.max(0, Math.min(p, $)) });
    }}
        /><span class="unit">${f}</span></label
      >`, a = (c, d, f, p) => u`<label class="check"
        ><input type="checkbox" .checked=${f} @change=${(g) => p(g.target.checked)} /><span
          >${c}<small>${d}</small></span
        ></label
      >`, o = Ue(e.form), l = (this.data?.raeume ?? []).filter((c) => c.id !== this.raumId), h = this.istMelder ? u`<div class="label-text">Welcher Melder meldet diese Zone?</div>
          <ul class="melder-liste">
            ${this.melder.map(
      (c) => u`<li>
                <label class="check"
                  ><input
                    type="checkbox"
                    .checked=${(e.melder ?? []).includes(c)}
                    @change=${(d) => {
        const f = d.target.checked, p = (e.melder ?? []).filter((g) => g !== c);
        this.updateZone(t, { melder: f ? [...p, c] : p });
      }}
                  /><span>${this.melderName(c)}</span></label
                >
              </li>`
    )}
          </ul>
          ${(e.melder ?? []).length ? m : u`<p class="note warn">Ohne Melder lässt sich die Zone nicht speichern.</p>`}` : m;
    return this.kannAendern ? u`<div class="inspector">
      ${h}
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
        ${Ke.map(
      (c) => u`<button class=${c.rolle === s ? "active" : ""} @click=${() => this.setRolle(t, c.rolle)}>
            <ha-icon icon=${c.icon}></ha-icon>${c.name}
          </button>`
    )}
      </div>
      <p class="hint small">${Se(s).text}</p>
      ${s === "tuer" ? u`<label class="field"
              >Wohin führt die Tür?<select
                @change=${(c) => {
      this.remember(), this.updateZone(t, { fuehrt_zu: c.target.value });
    }}
              >
                <option value="" ?selected=${!e.fuehrt_zu}>weiß nicht</option>
                <option value="aussen" ?selected=${e.fuehrt_zu === "aussen"}>nach draußen / Raum ohne Sensor</option>
                ${l.map((c) => u`<option value=${c.id} ?selected=${e.fuehrt_zu === c.id}>${c.name}</option>`)}
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
      ${s !== "ignorieren" ? u`<div class="summary">${xt(e)}</div>
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
        <p class="hint small">${Se(s).text}</p>
        ${s === "tuer" ? u`<div class="summary">Führt ${Dn(e, l)}.</div>` : m}
        ${s !== "ignorieren" ? u`<div class="summary">${xt(e)}</div>` : m}
      </div>`;
  }
  /** Radar-Raum mit Wänden: „Anwesenheit“ für den ganzen Raum kommt von selbst. */
  renderAnwesenheit() {
    if (this.istMelder || this.zones.some((s) => s.id === F)) return m;
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[F]?.belegt;
    return this.umriss.length < 3 ? u`<p class="hint small">„Anwesenheit“ für den ganzen Raum gibt es, sobald die Wände gezeichnet sind (unter „Sensor und Raum“).</p>` : u`<ul class="list">
      <li class="item">
        <div class="row static">
          <span class="marker-icon"><ha-icon icon="mdi:home-account"></ha-icon></span>
          <span class="name">Anwesenheit<small>ganzer Raum, von selbst (frei 5 s nach dem Letzten)</small></span>
          <span class="badge ${t ? n ? "on" : "off" : "off unreachable"}" style="--zone:var(--rz-bereich)">${t ? n ? "belegt" : "frei" : "nicht erreichbar"}</span>
        </div>
      </li>
    </ul>`;
  }
  renderZonesTab() {
    return u`
      ${this.renderAnwesenheit()}
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
    return this.oeffnungen.map((t, n) => Yn(e, t) ? -1 : n).filter((t) => t >= 0);
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
      const s = this.oeffnungen[n], i = Jn(this.umriss, s);
      if (!i) continue;
      let r = wt(ft(i, e, this.data.vorlagen), "tuer", this.data.vorlagen);
      r = { ...r, name: pe(s, n), fuehrt_zu: s.fuehrt_zu ?? "" }, e = [...e, r], t++;
    }
    this.zones = e, this.dirty = t > 0 || this.dirty, this.showToast(t ? `${t} Tür-${t === 1 ? "Zone" : "Zonen"} angelegt. Prüfen und „Speichern“.` : "Keine Tür ohne Tür-Zone gefunden.");
  }
  renderMelderTab() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[F]?.belegt, s = this.kandidaten, i = (h) => s?.melder.find((c) => c.id === h || c.entity_id === h)?.name ?? h, r = (s?.melder ?? []).filter((h) => !h.benutzt_von || h.benutzt_von === this.raumId || this.melder.includes(h.id)), a = this.melder.filter((h) => !r.some((c) => c.id === h || c.entity_id === h)).map((h) => ({ id: h, entity_id: h, name: "Unbekannter Melder", klasse: "", bereich_id: null, benutzt_von: this.raumId, geraet: null, typ: "nicht mehr in Home Assistant (gelöscht oder abgeschaltet), bitte abwählen" })), o = this.melderAuswahl([...r, ...a], this.raum?.bereich_id, this.melder), l = this.kannAendern ? this.radarFuerRaum() : null;
    return u`${l ? u`<div class="note">
            <p>
              Hier hängt der Radarsensor „${l.name}“. Als <b>Radar-Raum</b> sieht Raumzonen, wo genau jemand ist, und übernimmt die Zonen aus der
              Zonen-Karte. Wände, Türen, Lage im Haus und „Anwesenheit“ bleiben.
            </p>
            <div class="actions">
              <span class="spacer"></span>
              <button class="text small" ?disabled=${this.saving} @click=${() => void this.umwandeln(l.device_id, l.name)}>
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
      ${this.kannAendern ? u`${s ? u`${this.renderNurBereich(this.raum?.bereich_id)}<ul class="melder-liste voll">
                  ${o.map((h) => {
      const c = this.melder.includes(h.id) || this.melder.includes(h.entity_id);
      return u`<li>
                      <label class="check"
                        ><input
                          type="checkbox"
                          .checked=${c}
                          @change=${(d) => {
        const f = d.target.checked;
        if (this.melder = f ? [...this.melder, h.id] : this.melder.filter((p) => p !== h.id && p !== h.entity_id), !f) {
          const { [h.id]: p, ...g } = this.melderLagen;
          this.melderLagen = g, this.zones = this.zones.map((b) => ({ ...b, melder: (b.melder ?? []).filter(($) => $ !== h.id) }));
        }
        this.dirty = !0;
      }}
                        /><span>${h.name}<small>${this.melderInfo(h)}</small></span></label
                      >
                      ${c ? u`<div class="actions melder-aktionen">
                            ${this.melderLagen[h.id] ? m : u`<button class="text small" @click=${() => this.melderPlatzieren(h.id)}>
                                  <ha-icon icon="mdi:map-marker-plus-outline"></ha-icon>Im Plan platzieren
                                </button>`}
                            ${this.renderMelderErfassung(h.id)}
                            <button
                              class="text small"
                              @click=${() => {
        this.zoneFuerMelder = h.id, this.setTool("rechteck"), this.showToast(`Zone für „${h.name}“: im Plan ein Rechteck aufziehen.`);
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
                @change=${(h) => {
      const c = Number(h.target.value);
      Number.isFinite(c) && (this.nachlauf = Math.max(0, Math.min(this.data?.grenzen.melder_nachlauf_s ?? 3600, Math.round(c))), this.dirty = !0);
    }}
              /><span class="unit">s</span></label
            >
            <div class="summary">
              Der Raum gilt als belegt, solange ein Melder „Bewegung“ meldet, und noch ${Pt + this.nachlauf} s danach${this.nachlauf ? ` (${Pt} s Haltezeit und ${this.nachlauf} s Nachlauf)` : " (Haltezeit)"}. Dazu kommt die Nachlaufzeit, die am Melder selbst eingestellt ist. Sind alle Melder nicht erreichbar, bleibt der letzte Stand.
            </div>` : u`<ul class="doors">
            ${this.melder.map((h) => u`<li class="door"><ha-icon icon="mdi:motion-sensor"></ha-icon><span>${i(h)}</span></li>`)}
          </ul>`}
      ${this.kannAendern ? this.renderRoomEdit() : m}`;
  }
  renderRoomTab() {
    if (this.istMelder) return this.renderMelderTab();
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = e?.letzter_rahmen_vor_s, s = e ? e.figuren.filter((r) => !r.tags.includes("wiederhergestellt") && !r.tags.includes("stoerung")).length : 0, i = (r, a, o, l, h) => u`<label class="field"
        >${a}<input
          type="number"
          min=${l}
          max=${h}
          .value=${String(this.sensor[r])}
          @change=${(c) => {
      const d = Number(c.target.value);
      Number.isFinite(d) && (this.remember(), this.sensor = { ...this.sensor, [r]: Math.max(l, Math.min(h, d)) }, this.dirty = !0);
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
        </div>
        ${this.handyVoll ? m : u`<p class="hint small">Am besten mit dem Handy im Raum: Raumzonen schickt dir eine Nachricht in die Home-Assistant-App; Antippen öffnet den Assistenten mit großem Plan.</p>
              ${this.handyZiele && this.handyZiele.length > 1 ? u`<label class="field"
                    >Handy<select @change=${(o) => this.handyDienst = o.target.value}>
                      ${this.handyZiele.map((o) => u`<option value=${o.dienst} ?selected=${o.dienst === this.handyDienst}>${o.name}</option>`)}
                    </select></label
                  >` : m}
              <div class="actions">
                <button class="text small" @click=${() => void this.aufsHandy()}><ha-icon icon="mdi:cellphone-arrow-down"></ha-icon>Aufs Handy schicken</button>
                <button class="text small" @click=${() => this.handyVoll = !0}><ha-icon icon="mdi:fullscreen"></ha-icon>Große Ansicht</button>
              </div>`}`;
    const t = e.aktiv + 1, n = e.messung, s = n ? Math.max(0, Math.ceil((n.bis - Date.now()) / 1e3)) : 0, i = (o) => n ? u`<div class="note">Bitte ruhig stehen … noch ${s} s${n.hinweis ? u`<br />${n.hinweis}` : m}</div>` : u`<div class="actions"><span class="spacer"></span><button class="primary" ?disabled=${this.dirty} @click=${this.wizMessen}><ha-icon icon="mdi:human-handsdown"></ha-icon>${o}</button></div>`, r = u`<ol class="wiz-stellen">
      ${[0, 1, 2].map((o) => {
      const l = e.schritt === "vorher" ? !!e.raum[o] : e.modus === "umsetzen" ? !!e.sensor[o] : !!e.sensor[o] && !!e.raum[o];
      return u`<li class=${l ? "fertig" : o === e.aktiv ? "aktiv" : ""}>Stelle ${o + 1}${l ? " ✓" : ""}</li>`;
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
    else if (e.schritt === "nachher" && e.modus === "einmessen") {
      const o = e.raum[e.aktiv], l = this.wizAnker(), h = St(l).filter((c) => !e.raum.some((d) => d && d[0] === l[c].punkt[0] && d[1] === l[c].punkt[1]));
      a = o ? u`<p class="wiz-text">Stell dich auf <b>Stelle ${t}: ${e.namen?.[e.aktiv] ?? "die gewählte Stelle"}</b> (Kreis ${t} im Plan), allein im Raum, und tippe auf „Messen“. Dann ${Tt} s ruhig stehen.</p>
            ${r} ${i(`Stelle ${t} messen`)}
            ${n ? m : u`<div class="actions"><button class="text small" @click=${() => this.wiz = { ...e, raum: e.raum.map((c, d) => d === e.aktiv ? null : c) }}>Andere Stelle wählen</button></div>`}` : u`<p class="wiz-text">Wo stellst du dich für Stelle ${t} hin? Tippe einen Kreis im Plan an oder wähle hier:</p>
            ${r}
            <div class="wiz-wahl">
              ${(h.length ? h : l.map((c, d) => d)).slice(0, 4).map(
        (c) => u`<button class="text" @click=${() => this.wizStelle(l[c].punkt, l[c].name)}>
                  <span class="wiz-buchstabe">${String.fromCharCode(65 + c)}</span>${l[c].name}
                </button>`
      )}
            </div>
            <p class="hint small">Am besten die hervorgehobenen Kreise: sie liegen weit auseinander. Du kannst auch irgendwo anders hintippen.</p>`;
    } else if (e.schritt === "nachher")
      a = u`<p class="hint small">
              ${e.modus === "umsetzen" ? u`Stell dich wieder auf Stelle ${t} (im Plan markiert) und tippe auf „Messen“.` : u`Allein im Raum: Stell dich an eine Stelle, die du im Plan gut findest (z. B. Bettecke, Türmitte), und tippe auf „Messen“.
                    Danach tippst du sie im Plan an. Drei Stellen, mindestens 1 m auseinander, nicht auf einer Linie.`}
            </p>
            ${r} ${i(`Stelle ${t} messen`)}`;
    else {
      const o = e.ergebnis, l = o.rest_cm <= 15, h = this.raum.sensor, c = Math.round(Math.hypot(o.x - h.x, o.y - h.y));
      let d = Math.round(((o.winkel - h.winkel) % 360 + 540) % 360 - 180);
      d === -180 && (d = 180);
      const f = d === 0 ? "gleich ausgerichtet" : `um ${Math.abs(d)}° ${d > 0 ? "nach links" : "nach rechts"} gedreht`;
      a = u`<p class="summary">
          ${e.modus === "umsetzen" || c > 0 ? u`Der Sensor hängt jetzt ${c < 10 ? "fast an derselben Stelle" : `${c} cm von der alten Stelle entfernt`} und ist ${f}.` : m}
          Genauigkeit: etwa ± ${Math.max(1, Math.round(o.rest_cm))} cm.
        </p>
        ${l ? m : u`<p class="note warn">Ungenau. Besser noch einmal messen, ruhig stehen und genau dieselben Stellen treffen.</p>`}
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
      ${e.schritt === "vorher" || e.schritt === "nachher" ? this.renderFigurenWahl() : m}
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
                  <span class="name">${pe(e, t)}<small>${e.art === "tuer" ? "Tür" : "Offen"} · ${Math.round(e.bis - e.von)} cm breit${e.fuehrt_zu ? ` · zu ${this.tuerZielText(e.gegenstueck ? `tuer:${e.gegenstueck}` : e.fuehrt_zu)}` : ""}</small></span>
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
                          placeholder=${pe(e, t)}
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
      const a = r.key, o = this.tueren[a] ?? "", l = this.tuerNamen[a] ?? r.name;
      if (!this.kannAendern)
        return u`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${l}: ${this.tuerZielText(o)}</span></li>`;
      const h = o ? null : We(e, i.id, r.punkt);
      return u`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <div class="door-felder">
          <span class="door-name">${l}</span>
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
          ${h ? u`<div class="actions">
                <button
                  class="text small"
                  @click=${() => {
        this.tueren = { ...this.tueren, [a]: `tuer:${h.tuer.key}` }, this.dirty = !0;
      }}
                >
                  <ha-icon icon="mdi:link-variant"></ha-icon>Nächste Tür: ${this.tuerText(h.tuer)} (${(h.abstand / 100).toFixed(1).replace(".", ",")} m)
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
      const r = this.hausLive[i.id], a = r ? r.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0, o = i.id === this.hausSel, l = N(i), h = i.art === "melder", c = h ? !!r?.zonen[F]?.belegt : a > 0, d = !!r && r.verfuegbar && !r.problem;
      return u`<li class="item ${o ? "open" : ""}">
              <div class="row" @click=${() => this.hausSel = o ? "" : i.id}>
                <span class="marker-icon"><ha-icon icon=${h ? "mdi:motion-sensor" : "mdi:radar"}></ha-icon></span>
                <span class="name">${i.name}<small
                  >${h ? "Bewegungsmelder" : "Radarsensor"}${this.data?.stockwerke_ha?.length && !this.stockwerkeVon(i).length ? " · kein Stockwerk" : ""}${i.haus_gesetzt || this.dirty ? "" : " · noch nicht eingeordnet"}</small
                ></span>
                <span class="badge ${d ? c ? "on" : "off" : "off unreachable"}">${d ? h ? c ? "da" : "leer" : a ? `${a}` : "leer" : "nicht erreichbar"}</span>
              </div>
              ${o ? u`<div class="inspector">
                    ${this.kannAendern && t ? u`<div class="label-text">Drehen</div>
                          <div class="actions">
                            ${n(90, "mdi:rotate-left", "90°")} ${n(-90, "mdi:rotate-right", "90°")} ${n(5, "mdi:rotate-left", "5°")}
                            ${n(-5, "mdi:rotate-right", "5°")}
                          </div>` : m}
                    ${this.kannAendern ? this.renderRaumStockwerke(i) : m}
                    ${l.length ? u`<div class="label-text">Türen</div>
                          <ul class="doors">
                            ${l.map((f) => s(i, f))}
                          </ul>` : u`<p class="hint small">Keine Tür eingezeichnet. Im Raum mit dem Werkzeug „Tür oder Öffnung“ in eine Wand zeichnen${h ? "" : " oder eine Zone mit der Rolle „Tür“ anlegen"}.</p>`}
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
        const r = (o, l) => !t[o] || !t[o].startsWith("tuer:") && t[o] !== "aussen" && (!l || t[o] === l);
        if (!r(i.key)) continue;
        const a = We(e, s.id, i.punkt);
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
        this.showToast(`Nicht gelöscht: ${T(t)}`);
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
        (p, g) => u`<button class="plan-bild-wahl" @click=${() => void this.planAuswaehlen(g)}>
              <img src=${p.url} alt="Grundriss ${g + 1}" /><span>Grundriss ${g + 1}</span>
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
        const g = p.target.files?.[0];
        g && this.planLaden(g), p.target.value = "";
      }}
          />
        </label>
      </div>`;
    const n = this.planCmProPx(), s = this.data?.raeume ?? [], i = (p) => {
      if (!n) return "Größe: erst ein Maß eingeben";
      const g = se(e.g.raeume[p].punkte), b = ($) => ($ / 100).toFixed(1).replace(".", ",");
      return `ca. ${b((g.x1 - g.x0) * n)} × ${b((g.y1 - g.y0) * n)} m`;
    }, r = (p) => this.plan = { ...e, ...p }, a = (p) => E({ art: "vieleck", punkte: p }), o = (p) => {
      const g = p.currentTarget.getBoundingClientRect(), b = [(p.clientX - g.left) / g.width * e.g.breite, (p.clientY - g.top) / g.height * e.g.hoehe];
      r({ strecke: e.strecke.length >= 2 ? [b] : [...e.strecke, b] });
    }, l = e.g.breite / 120, h = w`${e.strecke.length === 2 ? w`<line class="plan-strecke" x1=${e.strecke[0][0]} y1=${e.strecke[0][1]} x2=${e.strecke[1][0]} y2=${e.strecke[1][1]} stroke-width=${l / 1.5} />` : m}${e.strecke.map(([p, g]) => w`<circle class="plan-strecke" cx=${p} cy=${g} r=${l} />`)}`, c = w`<svg class="plan-vorschau" viewBox="0 0 ${e.g.breite} ${e.g.hoehe}" @click=${o}>
      <image href=${e.bild} x="0" y="0" width=${e.g.breite} height=${e.g.hoehe} opacity="0.55" />
      ${e.g.raeume.map((p, g) => {
      const [b, $] = a(p.punkte), k = !!e.zuordnung[g];
      return w`<polygon class="plan-raum ${k ? "on" : ""}" points=${p.punkte.map((_) => _.join(",")).join(" ")} />
          <circle class="plan-nr" cx=${b} cy=${$} r=${e.g.breite / 40} /><text class="plan-nr" x=${b} y=${$} dy="0.35em" font-size=${e.g.breite / 30}>${g + 1}</text>`;
    })}
      ${e.g.luecken.map((p, g) => {
      const b = e.g.raeume[p.raum].punkte, $ = b[p.kante], k = b[(p.kante + 1) % b.length], _ = Math.hypot(k[0] - $[0], k[1] - $[1]) || 1, z = (I) => [$[0] + (k[0] - $[0]) * I / _, $[1] + (k[1] - $[1]) * I / _], [M, S] = z(p.von_px), [A, L] = z(p.bis_px);
      return w`<line class="plan-luecke ${e.art[g]}" x1=${M} y1=${S} x2=${A} y2=${L} stroke-width=${e.g.breite / 150} />`;
    })}
      ${h}
    </svg>`, d = e.zuordnung.filter(Boolean), f = d.length !== new Set(d).size;
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
          ${e.g.raeume.map((p, g) => u`<option value=${g} ?selected=${e.massRaum === g}>Raum ${g + 1}</option>`)}
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
      (p, g) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><b>${g + 1}</b></span>
              <span class="name">Raum ${g + 1}<small>${i(g)}</small></span>
              <select
                @change=${(b) => {
        const $ = [...e.zuordnung];
        $[g] = b.target.value, r({ zuordnung: $ });
      }}
              >
                <option value="" ?selected=${!e.zuordnung[g]}>nicht übernehmen</option>
                ${s.map((b) => u`<option value=${b.id} ?selected=${e.zuordnung[g] === b.id}>${b.name}</option>`)}
              </select>
            </div>
            ${e.g.luecken.map((b, $) => ({ l: b, li: $ })).filter(({ l: b }) => b.raum === g).map(
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
      ${f ? u`<p class="note warn">Jeder Raum nur einmal zuordnen.</p>` : m}
      ${s.length ? m : u`<p class="hint small">Zuerst Räume anlegen (Raum hinzufügen), dann hier zuordnen.</p>`}
      <div class="actions">
        <button class="text small" @click=${this.planZu}>Abbrechen</button>
        <span class="spacer"></span>
        <button class="primary" ?disabled=${!n || f || this.saving} @click=${this.planUebernehmen}>
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
    const s = this.hausExtra[e.id] ?? {}, i = s.stockwerke ?? e.stockwerke ?? [], r = this.stockwerkeVon(e), a = s.bereich_id ?? e.bereich_id ?? "", o = (l) => {
      this.hausExtra = { ...this.hausExtra, [e.id]: { ...s, ...l } }, this.dirty = !0;
    };
    return u`<div class="label-text">Bereich in Home Assistant</div>
      <label class="field"
        ><select @change=${(l) => o({ bereich_id: l.target.value })}>
          <option value="" ?selected=${!a}>keiner</option>
          ${n.map((l) => u`<option value=${l.id} ?selected=${l.id === a}>${l.name}</option>`)}
        </select></label
      >
      ${t.length ? u`<div class="label-text">Stockwerke${i.length ? "" : " (vom Bereich)"}</div>
            <div class="stockwerk-wahl">
              ${t.map(
      (l) => u`<label class="check"
                  ><input
                    type="checkbox"
                    .checked=${r.includes(l.id)}
                    @change=${(h) => {
        const c = h.target.checked, d = i.length ? i : r;
        o({ stockwerke: c ? [...d.filter((f) => f !== l.id), l.id] : d.filter((f) => f !== l.id) });
      }}
                  /><span>${l.name}</span></label
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
      const l = t.melder.includes(o.id);
      return u`<li>
        <label class="check"
          ><input
            type="checkbox"
            .checked=${l}
            ?disabled=${!!o.benutzt_von && !l}
            @change=${(h) => {
        const c = h.target.checked, d = c ? [...t.melder, o.id] : t.melder.filter((f) => f !== o.id);
        n({ melder: d, bereich_id: t.bereich_id || (c ? o.bereich_id ?? "" : t.bereich_id) });
      }}
          /><span
            >${o.name}<small
              >${this.melderInfo(o)}${o.benutzt_von ? ` · schon in „${this.data?.raeume.find((h) => h.id === o.benutzt_von)?.name ?? o.benutzt_von}“` : ""}</small
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
                              >${o.art === "radar" ? `Radarsensor ${e.fp400.find((l) => l.device_id === o.device_id)?.name ?? ""}` : `${o.melder.length} Melder in diesem Bereich`}</small
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
      ([o, l]) => u`<li class="gruppe">${o}</li>
                        ${l.map(a)}`
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
        ${r.map(([o, l]) => w`<rect x=${((o - e.von) / a * 1e3).toFixed(1)} y="0" width=${Math.max(3, (l - o) / a * 1e3).toFixed(1)} height="10" fill="var(--rz-bereich)" />`)}
      </svg>`;
    }, i = e ? Xn(e.raeume).slice(-12).reverse() : [];
    return u`<h3>Bewegungsprofil</h3>
      <div class="label-text">Wann war wo jemand? Die letzten</div>
      <div class="levels" role="group" aria-label="Zeitraum">
        <button class=${this.profilStunden === 0 ? "active" : ""} @click=${() => this.loadProfil(0)}>aus</button>
        ${Et.map((r) => u`<button class=${this.profilStunden === r ? "active" : ""} @click=${() => this.loadProfil(r)}>${r} h</button>`)}
      </div>
      ${this.profilLaedt ? u`<p class="hint">Rechnet …</p>` : e ? u`<ul class="list ausw">
                ${t.map((r) => {
      const a = e.raeume[r.id];
      return u`<li class="item" style="--zone:var(--rz-bereich)">
                    <div class="row static">
                      <span class="name">${r.name}<small>${a ? a.length ? `${a.length}-mal` : "niemand" : "keine Aufnahme"}</small></span>
                      <span class="dauer">${a?.length ? ue(qn(a)) : ""}</span>
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
      return w`<rect x=${a.toFixed(1)} y="0" width=${o.toFixed(1)} height="10" fill=${t} />`;
    })}
    </svg>`;
  }
  figurName(e) {
    return e.figur === "kurz" ? "Kurze Spuren" : `${e.hund ? "Hund?" : "Figur"} ${e.nummer}`;
  }
  renderAuswertungTab() {
    const e = this.ausw, t = (o) => o === F && this.istMelder ? "Jemand da" : this.zones.find((l) => l.id === o)?.name ?? o, n = (o) => {
      const l = this.zones.find((h) => h.id === o);
      return l ? de(he(l)) : o === F ? "var(--rz-bereich)" : "var(--muted)";
    }, s = u`<div class="levels" role="group" aria-label="Zeitraum">
      ${Et.map(
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
    const r = e.zonen.filter((o) => o.sekunden > 0).sort((o, l) => l.belegt_s - o.belegt_s), a = u`<div class="achse"><span>${this.uhr(e.von)}</span><span>${this.uhr(e.bis)}</span></div>`;
    return u`${i}
      <p class="hint small">${this.auswLaedt ? "Rechnet …" : `${this.uhr(e.von)} bis ${this.uhr(e.bis)}. Die Karte zeigt, wo jemand war: je dunkler, desto länger. Bei den Zonen steht, wie lange dort jemand war.`}</p>
      <h3>Zonen</h3>
      ${r.length ? u`<ul class="list ausw">
            ${r.map(
      (o) => u`<li class="item" style="--zone:${n(o.zone_id)}">
                <div class="row static">
                  <span class="dot"></span>
                  <span class="name">${t(o.zone_id)}<small
                    >${o.figuren.length ? o.figuren.slice(0, 4).map((l) => this.figurName(e.figuren.find((h) => h.figur === l))).join(", ") + (o.figuren.length > 4 ? ` und ${o.figuren.length - 4} weitere` : "") : "nur kurz"}</small
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
    const t = Mt(At(e.figuren.filter((i) => !i.hund).map((i) => i.zellen)), e.zelle_cm, 8);
    if (!t) return m;
    const n = Un(t, 600).filter((i) => !this.zones.some((r) => De(i.mitte, r.form))).slice(0, 4);
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
    return this.data ? this.data.raeume.length ? this.handyAktiv ? u`${this.renderHeader()}
        <div class="layout handy">${this.renderStage()}<div class="handy-sheet">${this.renderWizard()}
          <div class="actions"><button class="text small" @click=${() => {
      this.handyVoll = !1, this.wiz && this.wizEnde();
    }}><ha-icon icon="mdi:close"></ha-icon>Assistent schließen</button></div></div></div>
        ${this.toast ? u`<div class="toast" role="status">${this.toast}</div>` : m}` : u`${this.renderHeader()}
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
v.styles = Wn;
x([
  jt({ type: Boolean, reflect: !0 })
], v.prototype, "narrow", 2);
x([
  y()
], v.prototype, "data", 2);
x([
  y()
], v.prototype, "raumId", 2);
x([
  y()
], v.prototype, "zones", 2);
x([
  y()
], v.prototype, "sensor", 2);
x([
  y()
], v.prototype, "umriss", 2);
x([
  y()
], v.prototype, "oeffnungen", 2);
x([
  y()
], v.prototype, "selVertex", 2);
x([
  y()
], v.prototype, "selOpening", 2);
x([
  y()
], v.prototype, "openingDraft", 2);
x([
  y()
], v.prototype, "selected", 2);
x([
  y()
], v.prototype, "sensorOpen", 2);
x([
  y()
], v.prototype, "tab", 2);
x([
  y()
], v.prototype, "tool", 2);
x([
  y()
], v.prototype, "draft", 2);
x([
  y()
], v.prototype, "rectDraft", 2);
x([
  y()
], v.prototype, "hover", 2);
x([
  y()
], v.prototype, "view", 2);
x([
  y()
], v.prototype, "size", 2);
x([
  y()
], v.prototype, "live", 2);
x([
  y()
], v.prototype, "heat", 2);
x([
  y()
], v.prototype, "heatMin", 2);
x([
  y()
], v.prototype, "ausw", 2);
x([
  y()
], v.prototype, "auswStunden", 2);
x([
  y()
], v.prototype, "auswLaedt", 2);
x([
  y()
], v.prototype, "auswFehler", 2);
x([
  y()
], v.prototype, "kandidaten", 2);
x([
  y()
], v.prototype, "wiz", 2);
x([
  y()
], v.prototype, "handyVoll", 2);
x([
  y()
], v.prototype, "handyZiele", 2);
x([
  y()
], v.prototype, "handyDienst", 2);
x([
  y()
], v.prototype, "plan", 2);
x([
  y()
], v.prototype, "planLaedt", 2);
x([
  y()
], v.prototype, "planAuswahl", 2);
x([
  y()
], v.prototype, "planBilder", 2);
x([
  y()
], v.prototype, "planEdit", 2);
x([
  y()
], v.prototype, "planAenderung", 2);
x([
  y()
], v.prototype, "planMessen", 2);
x([
  y()
], v.prototype, "zeigePlan", 2);
x([
  y()
], v.prototype, "masse", 2);
x([
  y()
], v.prototype, "stockwerk", 2);
x([
  y()
], v.prototype, "wieImHaus", 2);
x([
  y()
], v.prototype, "hausExtra", 2);
x([
  y()
], v.prototype, "neuRaum", 2);
x([
  y()
], v.prototype, "profil", 2);
x([
  y()
], v.prototype, "profilStunden", 2);
x([
  y()
], v.prototype, "profilLaedt", 2);
x([
  y()
], v.prototype, "auswFigur", 2);
x([
  y()
], v.prototype, "layersOpen", 2);
x([
  y()
], v.prototype, "layers", 2);
x([
  y()
], v.prototype, "dirty", 2);
x([
  y()
], v.prototype, "zonesFollow", 2);
x([
  y()
], v.prototype, "saving", 2);
x([
  y()
], v.prototype, "error", 2);
x([
  y()
], v.prototype, "toast", 2);
x([
  y()
], v.prototype, "page", 2);
x([
  y()
], v.prototype, "lagen", 2);
x([
  y()
], v.prototype, "tueren", 2);
x([
  y()
], v.prototype, "wege", 2);
x([
  y()
], v.prototype, "tuerNamen", 2);
x([
  y()
], v.prototype, "hausLive", 2);
x([
  y()
], v.prototype, "hausSel", 2);
x([
  y()
], v.prototype, "aufnahme", 2);
x([
  y()
], v.prototype, "melder", 2);
x([
  y()
], v.prototype, "nurBereich", 2);
x([
  y()
], v.prototype, "nachlauf", 2);
x([
  y()
], v.prototype, "melderLagen", 2);
x([
  y()
], v.prototype, "aufnahmeTage", 2);
v = x([
  kn("raumzonen-panel")
], v);
export {
  v as RaumzonenPanel
};
