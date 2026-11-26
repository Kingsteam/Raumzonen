/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $e = globalThis, Ne = $e.ShadowRoot && ($e.ShadyCSS === void 0 || $e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ce = Symbol(), Xe = /* @__PURE__ */ new WeakMap();
let Mt = class {
  constructor(t, n, s) {
    if (this._$cssResult$ = !0, s !== Ce) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (Ne && t === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (t = Xe.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Xe.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Bt = (e) => new Mt(typeof e == "string" ? e : e + "", void 0, Ce), Nt = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((s, i, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[r + 1], e[0]);
  return new Mt(n, e, Ce);
}, Ct = (e, t) => {
  if (Ne) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const s = document.createElement("style"), i = $e.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, e.appendChild(s);
  }
}, Je = Ne ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const s of t.cssRules) n += s.cssText;
  return Bt(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Zt, defineProperty: Ut, getOwnPropertyDescriptor: Ft, getOwnPropertyNames: jt, getOwnPropertySymbols: Wt, getPrototypeOf: Vt } = Object, ze = globalThis, Ye = ze.trustedTypes, Kt = Ye ? Ye.emptyScript : "", Gt = ze.reactiveElementPolyfillSupport, he = (e, t) => e, ke = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Kt : null;
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
} }, Ze = (e, t) => !Zt(e, t), Qe = { attribute: !0, type: String, converter: ke, reflect: !1, useDefault: !1, hasChanged: Ze };
Symbol.metadata ??= Symbol("metadata"), ze.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Q = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = Qe) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, n);
      i !== void 0 && Ut(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, n, s) {
    const { get: i, set: r } = Ft(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Qe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(he("elementProperties"))) return;
    const t = Vt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(he("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(he("properties"))) {
      const n = this.properties, s = [...jt(n), ...Wt(n)];
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
      for (const i of s) n.unshift(Je(i));
    } else t !== void 0 && n.push(Je(t));
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
  attributeChangedCallback(t, n, s) {
    this._$AK(t, s);
  }
  _$ET(t, n) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : ke).toAttribute(n, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ke;
      this._$Em = i;
      const o = a.fromAttribute(n, r.type);
      this[i] = o ?? this._$Ej?.get(i) ?? o, this._$Em = null;
    }
  }
  requestUpdate(t, n, s, i = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (r = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? Ze)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
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
Q.elementStyles = [], Q.shadowRootOptions = { mode: "open" }, Q[he("elementProperties")] = /* @__PURE__ */ new Map(), Q[he("finalized")] = /* @__PURE__ */ new Map(), Gt?.({ ReactiveElement: Q }), (ze.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ue = globalThis, et = (e) => e, we = Ue.trustedTypes, tt = we ? we.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, St = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, At = "?" + B, qt = `<${At}>`, G = document, de = () => G.createComment(""), pe = (e) => e === null || typeof e != "object" && typeof e != "function", Fe = Array.isArray, Xt = (e) => Fe(e) || typeof e?.[Symbol.iterator] == "function", Re = `[ 	
\f\r]`, se = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, nt = /-->/g, st = />/g, j = RegExp(`>|${Re}(?:([^\\s"'>=/]+)(${Re}*=${Re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), it = /'/g, rt = /"/g, Rt = /^(?:script|style|textarea|title)$/i, Tt = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), u = Tt(1), v = Tt(2), te = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), at = /* @__PURE__ */ new WeakMap(), K = G.createTreeWalker(G, 129);
function Et(e, t) {
  if (!Fe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return tt !== void 0 ? tt.createHTML(t) : t;
}
const Jt = (e, t) => {
  const n = e.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = se;
  for (let o = 0; o < n; o++) {
    const l = e[o];
    let h, c, d = -1, p = 0;
    for (; p < l.length && (a.lastIndex = p, c = a.exec(l), c !== null); ) p = a.lastIndex, a === se ? c[1] === "!--" ? a = nt : c[1] !== void 0 ? a = st : c[2] !== void 0 ? (Rt.test(c[2]) && (i = RegExp("</" + c[2], "g")), a = j) : c[3] !== void 0 && (a = j) : a === j ? c[0] === ">" ? (a = i ?? se, d = -1) : c[1] === void 0 ? d = -2 : (d = a.lastIndex - c[2].length, h = c[1], a = c[3] === void 0 ? j : c[3] === '"' ? rt : it) : a === rt || a === it ? a = j : a === nt || a === st ? a = se : (a = j, i = void 0);
    const f = a === j && e[o + 1].startsWith("/>") ? " " : "";
    r += a === se ? l + qt : d >= 0 ? (s.push(h), l.slice(0, d) + St + l.slice(d) + B + f) : l + B + (d === -2 ? o : f);
  }
  return [Et(e, r + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class me {
  constructor({ strings: t, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const o = t.length - 1, l = this.parts, [h, c] = Jt(t, n);
    if (this.el = me.createElement(h, s), K.currentNode = this.el.content, n === 2 || n === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = K.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(St)) {
          const p = c[a++], f = i.getAttribute(d).split(B), b = /([.?@])?(.*)/.exec(p);
          l.push({ type: 1, index: r, name: b[2], strings: f, ctor: b[1] === "." ? Qt : b[1] === "?" ? en : b[1] === "@" ? tn : _e }), i.removeAttribute(d);
        } else d.startsWith(B) && (l.push({ type: 6, index: r }), i.removeAttribute(d));
        if (Rt.test(i.tagName)) {
          const d = i.textContent.split(B), p = d.length - 1;
          if (p > 0) {
            i.textContent = we ? we.emptyScript : "";
            for (let f = 0; f < p; f++) i.append(d[f], de()), K.nextNode(), l.push({ type: 2, index: ++r });
            i.append(d[p], de());
          }
        }
      } else if (i.nodeType === 8) if (i.data === At) l.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(B, d + 1)) !== -1; ) l.push({ type: 7, index: r }), d += B.length - 1;
      }
      r++;
    }
  }
  static createElement(t, n) {
    const s = G.createElement("template");
    return s.innerHTML = t, s;
  }
}
function ne(e, t, n = e, s) {
  if (t === te) return t;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const r = pe(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(e), i._$AT(e, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (t = ne(e, i._$AS(e, t.values), i, s)), t;
}
class Yt {
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
    const { el: { content: n }, parts: s } = this._$AD, i = (t?.creationScope ?? G).importNode(n, !0);
    K.currentNode = i;
    let r = K.nextNode(), a = 0, o = 0, l = s[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let h;
        l.type === 2 ? h = new fe(r, r.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (h = new nn(r, this, t)), this._$AV.push(h), l = s[++o];
      }
      a !== l?.index && (r = K.nextNode(), a++);
    }
    return K.currentNode = G, i;
  }
  p(t) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, n), n += s.strings.length - 2) : s._$AI(t[n])), n++;
  }
}
class fe {
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
    t = ne(this, t, n), pe(t) ? t === m || t == null || t === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : t !== this._$AH && t !== te && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Xt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== m && pe(this._$AH) ? this._$AA.nextSibling.data = t : this.T(G.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = me.createElement(Et(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new Yt(i, this), a = r.u(this.options);
      r.p(n), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let n = at.get(t.strings);
    return n === void 0 && at.set(t.strings, n = new me(t)), n;
  }
  k(t) {
    Fe(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of t) i === n.length ? n.push(s = new fe(this.O(de()), this.O(de()), this, this.options)) : s = n[i], s._$AI(r), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t !== this._$AB; ) {
      const s = et(t).nextSibling;
      et(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class _e {
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
    if (r === void 0) t = ne(this, t, n, 0), a = !pe(t) || t !== this._$AH && t !== te, a && (this._$AH = t);
    else {
      const o = t;
      let l, h;
      for (t = r[0], l = 0; l < r.length - 1; l++) h = ne(this, o[s + l], n, l), h === te && (h = this._$AH[l]), a ||= !pe(h) || h !== this._$AH[l], h === m ? t = m : t !== m && (t += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Qt extends _e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === m ? void 0 : t;
  }
}
class en extends _e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== m);
  }
}
class tn extends _e {
  constructor(t, n, s, i, r) {
    super(t, n, s, i, r), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = ne(this, t, n, 0) ?? m) === te) return;
    const s = this._$AH, i = t === m && s !== m || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== m && (s === m || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class nn {
  constructor(t, n, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ne(this, t);
  }
}
const sn = Ue.litHtmlPolyfillSupport;
sn?.(me, fe), (Ue.litHtmlVersions ??= []).push("3.3.3");
const rn = (e, t, n) => {
  const s = n?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new fe(t.insertBefore(de(), r), r, void 0, n ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const je = globalThis;
class ce extends Q {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = rn(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return te;
  }
}
ce._$litElement$ = !0, ce.finalized = !0, je.litElementHydrateSupport?.({ LitElement: ce });
const an = je.litElementPolyfillSupport;
an?.({ LitElement: ce });
(je.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const on = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ln = { attribute: !0, type: String, converter: ke, reflect: !1, hasChanged: Ze }, hn = (e = ln, t, n) => {
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
function Pt(e) {
  return (t, n) => typeof n == "object" ? hn(e, t, n) : ((s, i, r) => {
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
  return Pt({ ...e, state: !0, attribute: !1 });
}
const cn = 25;
function Ot(e) {
  return e * Math.PI / 180;
}
function q([e, t], n, [s, i] = [0, 0]) {
  const r = Ot(n), a = Math.cos(r), o = Math.sin(r), l = e - s, h = t - i;
  return [s + l * a - h * o, i + l * o + h * a];
}
function He(e, t) {
  return Math.hypot(e[0] - t[0], e[1] - t[1]);
}
function un(e, t) {
  return [Math.round(e[0] / t) * t, Math.round(e[1] / t) * t];
}
function X(e) {
  return [Math.round(e[0] * 10) / 10, Math.round(e[1] * 10) / 10];
}
function ve(e, t, n, s) {
  const i = t / 2, r = n / 2;
  return [
    [-i, -r],
    [i, -r],
    [i, r],
    [-i, r]
  ].map((a) => q([e[0] + a[0], e[1] + a[1]], s, e));
}
function We(e) {
  const t = e.x0 ?? 0, n = e.y0 ?? 0;
  return e.zellen.map(([s, i]) => ({ x: t + s * e.groesse, y: n + i * e.groesse, s: e.groesse }));
}
function Ve(e, t, n = 0, s = 0) {
  return [Math.floor((e[0] - n) / t), Math.floor((e[1] - s) / t)];
}
function V(e) {
  if (e.art === "vieleck") return e.punkte;
  if (e.art === "rechteck") return ve(e.mitte, e.breite, e.tiefe, e.winkel);
  const t = We(e), n = t.flatMap((l) => [l.x, l.x + l.s]), s = t.flatMap((l) => [l.y, l.y + l.s]);
  if (!n.length) return [];
  const [i, r, a, o] = [Math.min(...n), Math.max(...n), Math.min(...s), Math.max(...s)];
  return [
    [i, a],
    [r, a],
    [r, o],
    [i, o]
  ];
}
function dn([e, t], n) {
  let s = !1;
  for (let i = 0, r = n.length - 1; i < n.length; r = i++) {
    const [a, o] = n[i], [l, h] = n[r];
    o > t != h > t && e < a + (t - o) * (l - a) / (h - o) && (s = !s);
  }
  return s;
}
function Te(e, t) {
  if (t.art === "zellen") {
    const [n, s] = Ve(e, t.groesse, t.x0 ?? 0, t.y0 ?? 0);
    return t.zellen.some(([i, r]) => i === n && r === s);
  }
  return dn(e, V(t));
}
function pn(e) {
  if (!e.length) return [0, 0];
  let t = 0, n = 0, s = 0;
  for (let i = 0, r = e.length - 1; i < e.length; r = i++) {
    const [a, o] = e[r], [l, h] = e[i], c = a * h - l * o;
    t += c, n += (a + l) * c, s += (o + h) * c;
  }
  return Math.abs(t) < 1e-9 ? [e.reduce((i, r) => i + r[0], 0) / e.length, e.reduce((i, r) => i + r[1], 0) / e.length] : [n / (3 * t), s / (3 * t)];
}
function T(e) {
  if (e.art === "rechteck") return e.mitte;
  if (e.art === "zellen") {
    const t = We(e), n = t.length || 1;
    return [t.reduce((s, i) => s + i.x + i.s / 2, 0) / n, t.reduce((s, i) => s + i.y + i.s / 2, 0) / n];
  }
  return pn(e.punkte);
}
function mn(e) {
  let t = 0;
  for (let n = 0, s = e.length - 1; n < e.length; s = n++)
    t += e[s][0] * e[n][1] - e[n][0] * e[s][1];
  return Math.abs(t) / 2;
}
function be(e, t, n) {
  return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function fn(e) {
  const t = e.length;
  for (let n = 0; n < t; n++)
    for (let s = n + 1; s < t; s++) {
      if (Math.abs(n - s) === 1 || Math.abs(n - s) === t - 1) continue;
      const [i, r] = [e[n], e[(n + 1) % t]], [a, o] = [e[s], e[(s + 1) % t]];
      if (be(i, r, a) * be(i, r, o) < 0 && be(a, o, i) * be(a, o, r) < 0) return !0;
    }
  return !1;
}
function Le(e) {
  return e.art === "zellen" ? e.zellen.length ? "" : "Keine Zelle gewählt" : e.art === "rechteck" ? e.breite > 0 && e.tiefe > 0 ? "" : "Rechteck ohne Fläche" : e.punkte.length < 3 ? "Mindestens drei Ecken" : fn(e.punkte) ? "Kanten überschneiden sich" : mn(e.punkte) < 1 ? "Vieleck ohne Fläche" : "";
}
function Ie(e, t, n) {
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map((r) => X([r[0] + t, r[1] + n])) };
  if (e.art === "rechteck") return { ...e, mitte: X([e.mitte[0] + t, e.mitte[1] + n]) };
  const s = Math.round(t / e.groesse), i = Math.round(n / e.groesse);
  return { ...e, zellen: e.zellen.map(([r, a]) => [r + s, a + i]) };
}
function De(e) {
  const t = Ot(e);
  return [-Math.sin(t), Math.cos(t)];
}
function ot(e, t, n, s, i = 36) {
  const r = [];
  s >= 360 || r.push(e);
  const o = t - s / 2;
  for (let l = 0; l <= i; l++) {
    const h = o + s * l / i, [c, d] = De(h);
    r.push([e[0] + c * n, e[1] + d * n]);
  }
  return r;
}
function gn(e, t) {
  const n = q(e, t.winkel);
  return [t.x + n[0], t.y + n[1]];
}
function Ee(e, t) {
  const n = Math.atan2(-(t[0] - e[0]), t[1] - e[1]) * 180 / Math.PI;
  return Math.round(n * 10) / 10;
}
function Pe(e, t, n) {
  const s = n[0] - t[0], i = n[1] - t[1], r = s * s + i * i;
  if (r === 0) return He(e, t);
  const a = Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r));
  return He(e, [t[0] + a * s, t[1] + a * i]);
}
function Ht(e, t) {
  return q([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function bn(e, t, n) {
  const s = (i) => X(gn(Ht(i, t), n));
  if (e.art === "vieleck") return { ...e, punkte: e.punkte.map(s) };
  if (e.art === "rechteck") {
    let i = e.winkel + n.winkel - t.winkel;
    return i > 180 && (i -= 360), i <= -180 && (i += 360), { ...e, mitte: s(e.mitte), winkel: Math.round(i * 10) / 10 };
  }
  return t.winkel !== n.winkel ? e : Ie(e, n.x - t.x, n.y - t.y);
}
function O(e, t) {
  const [n, s] = q(e, t.winkel);
  return [n + t.x, s + t.y];
}
function $n(e, t) {
  return q([e[0] - t.x, e[1] - t.y], -t.winkel);
}
function vn(e, t, n) {
  if (e.length >= 3) return e;
  const s = [n];
  for (const d of t) s.push(...V(d));
  const i = s.map((d) => d[0]), r = s.map((d) => d[1]), a = 40, [o, l] = [Math.min(...i) - a, Math.max(...i) + a], [h, c] = [Math.min(...r) - a, Math.max(...r) + a];
  return [
    [o, h],
    [l, h],
    [l, c],
    [o, c]
  ];
}
function xn(e, t = 100) {
  const n = {};
  let s = -1 / 0;
  for (const i of e)
    if (i.lage) {
      n[i.id] = i.lage;
      for (const r of i.outline) s = Math.max(s, O(r, i.lage)[0]);
    }
  s === -1 / 0 && (s = -t);
  for (const i of e) {
    if (i.lage) continue;
    const r = Math.min(...i.outline.map((l) => l[0])), a = Math.max(...i.outline.map((l) => l[0])), o = { x: s + t - r, y: 0, winkel: 0 };
    n[i.id] = o, s = o.x + a;
  }
  return n;
}
const Lt = {
  normal: "normal",
  ausgang: "ausgang",
  hundeplatz: "hundeplatz",
  stoerquelle: "stoerquelle",
  stelle: "stelle",
  durchgang: "durchgang"
};
class kn {
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
function It(e, t) {
  const n = new Set(t.map((i) => i.name));
  if (!n.has(e)) return e;
  let s = 2;
  for (; n.has(`${e} ${s}`); ) s++;
  return `${e} ${s}`;
}
function wn(e, t, n, s = "normal") {
  return {
    name: It("Zone", t),
    art: s,
    form: e,
    regel: { ...n[Lt[s]] }
  };
}
function yn(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s[t] = X(n), { ...e, punkte: s };
}
function lt(e, t, n) {
  if (e.art !== "vieleck") return e;
  const s = e.punkte.slice();
  return s.splice(t + 1, 0, X(n)), { ...e, punkte: s };
}
function zn(e, t) {
  return e.art !== "vieleck" || e.punkte.length <= 3 ? e : { ...e, punkte: e.punkte.filter((n, s) => s !== t) };
}
function ht(e, t, n) {
  const [s, i] = Ve(t, e.groesse, e.x0 ?? 0, e.y0 ?? 0), r = e.zellen.some(([a, o]) => a === s && o === i);
  return n && !r ? { ...e, zellen: [...e.zellen, [s, i]] } : !n && r ? { ...e, zellen: e.zellen.filter(([a, o]) => a !== s || o !== i) } : e;
}
function ct(e, t) {
  return {
    art: "rechteck",
    mitte: X([(e[0] + t[0]) / 2, (e[1] + t[1]) / 2]),
    breite: Math.round(Math.abs(t[0] - e[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(t[1] - e[1]) * 10) / 10,
    winkel: 0
  };
}
function _n(e) {
  for (const t of e) {
    if (!t.name.trim()) return "Eine Zone hat keinen Namen";
    const n = Le(t.form);
    if (n) return `${t.name}: ${n}`;
  }
  return "";
}
function Mn(e, t, n) {
  const s = e.name.toLowerCase(), i = s.includes("bett"), a = s.includes("tür") || s.includes("tuer") || s.includes("door") ? "ausgang" : "normal";
  return {
    name: It(e.name, t),
    art: a,
    form: e.form,
    regel: { ...n[i ? "bett" : Lt[a]] }
  };
}
const Be = [
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
function xe(e) {
  return Be.find((t) => t.rolle === e) ?? Be[1];
}
function ie(e) {
  return e.art === "ausgang" ? "tuer" : e.art === "hundeplatz" ? "hund" : e.art === "stelle" ? "stelle" : e.art === "durchgang" ? "durchgang" : e.art === "stoerquelle" ? "ignorieren" : e.regel.schlaefer_halten ? "bett" : "bereich";
}
function Sn(e, t, n) {
  const s = xe(t), i = { ...e, art: s.art, regel: { ...n[s.vorlage] } };
  return s.art !== "ausgang" && delete i.fuehrt_zu, i;
}
function ut(e) {
  return e === 0 ? "sofort" : `nach ${String(e).replace(".", ",")} s`;
}
function dt(e) {
  const t = e.regel;
  if (e.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const n = [`belegt ${ut(t.belegt_nach_s)}`, `frei ${ut(t.frei_nach_s)}`];
  t.schlaefer_halten && n.push("hält Schläfer"), t.max_personen === 1 && n.push("eine Person"), t.hund_ignorieren && n.push("ohne Hund");
  const s = n.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}
function An(e, t, n, s = 10) {
  const i = e.breite / 2, r = e.tiefe / 2, a = [
    t === 0 || t === 3 ? e.mitte[0] + i : e.mitte[0] - i,
    t === 0 || t === 1 ? e.mitte[1] + r : e.mitte[1] - r
  ], o = Math.max(s, Math.abs(n[0] - a[0])), l = Math.max(s, Math.abs(n[1] - a[1])), h = n[0] >= a[0] ? 1 : -1, c = n[1] >= a[1] ? 1 : -1;
  return {
    ...e,
    winkel: 0,
    breite: Math.round(o * 10) / 10,
    tiefe: Math.round(l * 10) / 10,
    mitte: X([a[0] + h * o / 2, a[1] + c * l / 2])
  };
}
function Rn(e, t) {
  const n = e.fuehrt_zu ?? "";
  return n ? n === "aussen" ? "nach draußen oder in einen Raum ohne Sensor" : t.find((s) => s.id === n)?.name ?? "unbekannter Raum" : "noch nicht eingetragen";
}
function Tn(e) {
  let t = (e % 360 + 540) % 360 - 180;
  return t === -180 && (t = 180), t;
}
const Oe = (e) => Math.round(e * 10) / 10 + 0;
function pt(e, t, n) {
  return e.art === "vieleck" ? { ...e, punkte: e.punkte.map((s) => q(s, n, t).map((i) => Oe(i))) } : e.art === "rechteck" ? { ...e, mitte: q(e.mitte, n, t).map((s) => Oe(s)), winkel: Oe(Tn(e.winkel + n)) } : e;
}
function Y(e) {
  return e.map((t, n) => {
    const s = e[(n + 1) % e.length];
    return [(t[0] + s[0]) / 2, (t[1] + s[1]) / 2];
  });
}
function Me(e, t) {
  return [e[t], e[(t + 1) % e.length]];
}
function ue(e, t, n) {
  const [s, i] = Me(e, t), r = i[0] - s[0], a = i[1] - s[1], o = Math.hypot(r, a);
  if (!o) return 0;
  const l = ((n[0] - s[0]) * r + (n[1] - s[1]) * a) / o;
  return Math.max(0, Math.min(o, l));
}
function En(e, t, n, s, i = 20) {
  const [r, a] = Me(e, t), o = Math.hypot(a[0] - r[0], a[1] - r[1]);
  let l = Math.round(ue(e, t, n) / 5) * 5, h = Math.round(ue(e, t, s) / 5) * 5;
  return h < l && ([l, h] = [h, l]), h - l < i ? null : { kante: t, von: l, bis: Math.min(h, Math.floor(o)), art: "tuer" };
}
function re(e, t) {
  const [n, s] = Me(e, t.kante), i = Math.hypot(s[0] - n[0], s[1] - n[1]) || 1, r = (a) => [n[0] + (s[0] - n[0]) * a / i, n[1] + (s[1] - n[1]) * a / i];
  return [r(t.von), r(t.bis)];
}
function mt(e, t, n) {
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
function Pn(e, t, n = 20) {
  const s = [];
  for (const i of t) {
    if (i.kante >= e.length) continue;
    const [r, a] = Me(e, i.kante), o = Math.floor(Math.hypot(a[0] - r[0], a[1] - r[1])), l = Math.min(i.bis, o);
    l - i.von >= n && s.push({ ...i, bis: l });
  }
  return s;
}
const On = Nt`
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
`, ft = 600;
function Hn(e) {
  const t = Math.max(1, Math.ceil(e * 3)), n = new Float32Array(2 * t + 1);
  let s = 0;
  for (let i = -t; i <= t; i++) {
    const r = Math.exp(-(i * i) / (2 * e * e));
    n[i + t] = r, s += r;
  }
  for (let i = 0; i < n.length; i++) n[i] /= s;
  return n;
}
function gt(e, t, n = 8) {
  if (!e.length || !(t > 0)) return null;
  let s = 1 / 0, i = -1 / 0, r = 1 / 0, a = -1 / 0;
  for (const [$, z] of e)
    s = Math.min(s, $), i = Math.max(i, $), r = Math.min(r, z), a = Math.max(a, z);
  const o = Math.max(0.6, n / t), l = Hn(o), h = (l.length - 1) / 2;
  s -= h, r -= h;
  const c = Math.min(ft, i - s + 1 + h), d = Math.min(ft, a - r + 1 + h), p = new Float32Array(c * d);
  for (const [$, z, M] of e) {
    const x = $ - s, _ = z - r;
    x >= 0 && x < c && _ >= 0 && _ < d && M > 0 && (p[_ * c + x] += M);
  }
  const f = new Float32Array(c * d);
  for (let $ = 0; $ < d; $++)
    for (let z = 0; z < c; z++) {
      const M = p[$ * c + z];
      if (M)
        for (let x = -h; x <= h; x++) {
          const _ = z + x;
          _ >= 0 && _ < c && (f[$ * c + _] += M * l[x + h]);
        }
    }
  const b = new Float32Array(c * d);
  let g = 0;
  for (let $ = 0; $ < d; $++)
    for (let z = 0; z < c; z++) {
      const M = f[$ * c + z];
      if (M)
        for (let x = -h; x <= h; x++) {
          const _ = $ + x;
          _ >= 0 && _ < d && (b[_ * c + z] += M * l[x + h]);
        }
    }
  for (let $ = 0; $ < b.length; $++) g = Math.max(g, b[$]);
  return { x0: s * t, y0: r * t, zelle: t, nx: c, ny: d, werte: b, max: g };
}
function Ln(e, t, n = 0.2) {
  return !(e > n) || !(t > 0) ? 0 : Math.min(1, Math.log1p(e) / Math.log1p(t));
}
function In(e, t, n = 0.85) {
  const s = new Uint8ClampedArray(e.nx * e.ny * 4);
  for (let i = 0; i < e.ny; i++) {
    const r = e.ny - 1 - i;
    for (let a = 0; a < e.nx; a++) {
      const o = Ln(e.werte[i * e.nx + a], e.max);
      if (!o) continue;
      const l = (r * e.nx + a) * 4;
      s[l] = t[0], s[l + 1] = t[1], s[l + 2] = t[2], s[l + 3] = Math.round(255 * n * (0.15 + 0.85 * o));
    }
  }
  return s;
}
function bt(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e)
    for (const [s, i, r] of n) {
      const a = `${s},${i}`, o = t.get(a);
      o ? o[2] += r : t.set(a, [s, i, r]);
    }
  return [...t.values()];
}
function ae(e) {
  if (e < 60) return `${Math.round(e)} s`;
  const t = Math.round(e / 60);
  if (t < 60) return `${t} min`;
  const n = Math.floor(t / 60), s = t % 60;
  return s ? `${n} h ${s} min` : `${n} h`;
}
function Dn(e, t = 300, n = 0.2, s = 15) {
  const { nx: i, ny: r, werte: a } = e, o = e.max * n, l = new Uint8Array(i * r), h = [];
  for (let c = 0; c < i * r; c++) {
    if (l[c] || a[c] < o) continue;
    const d = [c];
    l[c] = 1;
    let [p, f, b, g, $] = [1 / 0, -1 / 0, 1 / 0, -1 / 0, 0];
    for (; d.length; ) {
      const x = d.pop(), _ = x % i, A = x / i | 0;
      p = Math.min(p, _), f = Math.max(f, _), b = Math.min(b, A), g = Math.max(g, A), $ += a[x];
      for (const S of [_ > 0 ? x - 1 : -1, _ < i - 1 ? x + 1 : -1, x - i, x + i])
        S < 0 || S >= i * r || l[S] || a[S] < o || (l[S] = 1, d.push(S));
    }
    if ($ < t) continue;
    const z = (f - p + 1) * e.zelle + 2 * s, M = (g - b + 1) * e.zelle + 2 * s;
    h.push({
      mitte: [Math.round(e.x0 + (p + f + 1) / 2 * e.zelle), Math.round(e.y0 + (b + g + 1) / 2 * e.zelle)],
      breite: Math.round(z),
      tiefe: Math.round(M),
      sekunden: Math.round($)
    });
  }
  return h.sort((c, d) => d.sekunden - c.sekunden);
}
function P(e) {
  const t = e;
  return t?.code === "unknown_command" ? Bn : t?.message ?? String(e);
}
const Bn = "Raumzonen wurde aktualisiert und wartet auf einen Neustart von Home Assistant (Einstellungen → System → Neu starten).";
function Nn(e, t) {
  const n = e.length;
  if (n < 3 || t.kante < 0 || t.kante >= n) return null;
  const [s, i] = e[t.kante], [r, a] = e[(t.kante + 1) % n], o = Math.hypot(r - s, a - i);
  if (!o) return null;
  const l = (t.von + t.bis) / 2 / o;
  return [s + (r - s) * l, i + (a - i) * l];
}
function oe(e) {
  const t = [];
  for (const n of e.zonen)
    n.art !== "ausgang" || !n.id || t.push({ key: `${e.id}/${n.id}`, raumId: e.id, name: n.name, punkt: T(n.form), ziel: n.fuehrt_zu ?? "", zoneId: n.id });
  return (e.oeffnungen ?? []).forEach((n, s) => {
    const i = Nn(e.umriss, n);
    if (!i) return;
    const r = n.art === "offen" ? `Durchgang ${s + 1}` : `Tür ${s + 1} in der Wand`;
    t.push({ key: `${e.id}/#${s}`, raumId: e.id, name: r, punkt: i, ziel: n.fuehrt_zu ?? "", oeffnung: s });
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
function Zn(e) {
  return e.reduce((t, [n, s]) => t + (s - n), 0);
}
function Un(e, t = 30) {
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
function $t(e) {
  if (e.length < 3) return "Es braucht drei Stellen.";
  let t = 1 / 0;
  for (let a = 0; a < e.length; a++)
    for (let o = a + 1; o < e.length; o++) t = Math.min(t, Math.hypot(e[a][0] - e[o][0], e[a][1] - e[o][1]));
  const [n, s, i] = e, r = Math.abs((s[0] - n[0]) * (i[1] - n[1]) - (i[0] - n[0]) * (s[1] - n[1])) / 2;
  return t < 100 ? "Zwei Stellen liegen zu nah beieinander (weniger als 1 m). Weiter auseinander gehen." : r < 5e3 ? "Die drei Stellen liegen fast auf einer Linie. Eine Stelle seitlich wählen." : "";
}
function Fn(e, t) {
  const n = Math.min(e.length, t.length);
  if (n < 2) return null;
  const s = (g) => [g.reduce(($, z) => $ + z[0], 0) / n, g.reduce(($, z) => $ + z[1], 0) / n], i = s(e.slice(0, n)), r = s(t.slice(0, n));
  let a = 0, o = 0;
  for (let g = 0; g < n; g++) {
    const [$, z] = [e[g][0] - i[0], e[g][1] - i[1]], [M, x] = [t[g][0] - r[0], t[g][1] - r[1]];
    a += $ * x - z * M, o += $ * M + z * x;
  }
  if (!a && !o) return null;
  const l = Math.atan2(a, o), [h, c] = [Math.cos(l), Math.sin(l)], d = r[0] - (i[0] * h - i[1] * c), p = r[1] - (i[0] * c + i[1] * h);
  let f = 0;
  for (let g = 0; g < n; g++) {
    const $ = d + e[g][0] * h - e[g][1] * c, z = p + e[g][0] * c + e[g][1] * h;
    f += Math.hypot($ - t[g][0], z - t[g][1]);
  }
  let b = l * 180 / Math.PI;
  return b = Math.round(b * 10) / 10, b <= -180 && (b += 360), { x: Math.round(d), y: Math.round(p), winkel: b, rest_cm: Math.round(f / n * 10) / 10 };
}
function jn(e) {
  if (!e.length) return null;
  const t = (i) => {
    const r = [...i].sort((o, l) => o - l), a = r.length >> 1;
    return r.length % 2 ? r[a] : (r[a - 1] + r[a]) / 2;
  }, n = [t(e.map((i) => i[0])), t(e.map((i) => i[1]))], s = e.map((i) => Math.hypot(i[0] - n[0], i[1] - n[1]));
  return { punkt: [Math.round(n[0] * 10) / 10, Math.round(n[1] * 10) / 10], streuung_cm: Math.round(t(s) * 10) / 10 };
}
function Wn(e) {
  const t = new TextEncoder().encode("endstream");
  let n = null;
  for (let s = 0; s < e.length - 3; s++) {
    if (e[s] !== 255 || e[s + 1] !== 216 || e[s + 2] !== 255) continue;
    let i = s + 3;
    e: for (; i < e.length - t.length; i++) {
      for (let a = 0; a < t.length; a++) if (e[i + a] !== t[a]) continue e;
      break;
    }
    let r = i;
    for (; r > s && !(e[r - 2] === 255 && e[r - 1] === 217); ) r--;
    r > s && (!n || r - s > n.length) && (n = e.subarray(s, r)), s = i;
  }
  return n;
}
function Vn(e, t) {
  const n = Math.floor(e.width / t), s = Math.floor(e.height / t), i = new Uint8Array(n * s), r = new Uint8Array(n * s), a = e.data;
  for (let l = 0; l < s; l++)
    for (let h = 0; h < n; h++) {
      let c = 0, d = 0;
      for (let p = 0; p < t; p++)
        for (let f = 0; f < t; f++) {
          const b = ((l * t + p) * e.width + (h * t + f)) * 4, [g, $, z] = [a[b], a[b + 1], a[b + 2]];
          z > g + 40 && z > $ + 10 && z > 120 && (c = 1), g + $ + z < 270 && (d = 1);
        }
      i[l * n + h] = c, r[l * n + h] = d;
    }
  const o = new Uint8Array(n * s);
  for (let l = 1; l < s - 1; l++)
    for (let h = 1; h < n - 1; h++)
      if (i[l * n + h]) for (let c = -1; c <= 1; c++) for (let d = -1; d <= 1; d++) o[(l + c) * n + h + d] = 1;
  return { w: n, h: s, blau: o, dunkel: r };
}
function Kn(e) {
  const { w: t, h: n, blau: s } = e, i = new Int32Array(t * n).fill(-1), r = new Int32Array(t * n);
  let a = 0;
  for (let o = 0; o < t * n; o++) {
    if (s[o] || i[o] >= 0) continue;
    let l = 0;
    for (r[l++] = o, i[o] = a; l; ) {
      const h = r[--l], c = h % t, d = [c > 0 ? h - 1 : -1, c < t - 1 ? h + 1 : -1, h - t, h + t];
      for (const p of d)
        p < 0 || p >= t * n || s[p] || i[p] >= 0 || (i[p] = a, r[l++] = p);
    }
    a++;
  }
  return { label: i, anzahl: a };
}
function Gn(e, t, n, s) {
  const i = (p, f) => p >= 0 && f >= 0 && p < t && f < n && e[f * t + p] === s;
  let r = -1, a = -1;
  for (let p = 0; p < t * n; p++)
    if (e[p] === s) {
      r = p % t, a = Math.floor(p / t);
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
  for (let p = 0; p < t * n * 2; p++) {
    let f = !1;
    for (let b = 0; b < 8; b++) {
      const g = (d + 6 + b) % 8, [$, z] = [h + o[g][0], c + o[g][1]];
      if (i($, z)) {
        h = $, c = z, d = g, f = !0;
        break;
      }
    }
    if (!f || h === r && c === a) break;
    l.push([h, c]);
  }
  return l;
}
function Dt(e, t, n) {
  const [s, i] = [n[0] - t[0], n[1] - t[1]], r = s * s + i * i, a = r ? Math.max(0, Math.min(1, ((e[0] - t[0]) * s + (e[1] - t[1]) * i) / r)) : 0;
  return Math.hypot(e[0] - t[0] - a * s, e[1] - t[1] - a * i);
}
function ye(e, t) {
  if (e.length < 3) return e;
  let n = 0, s = 0;
  for (let a = 1; a < e.length - 1; a++) {
    const o = Dt(e[a], e[0], e[e.length - 1]);
    o > n && (n = o, s = a);
  }
  if (n <= t) return [e[0], e[e.length - 1]];
  const i = ye(e.slice(0, s + 1), t), r = ye(e.slice(s), t);
  return [...i.slice(0, -1), ...r];
}
function qn(e, t) {
  if (e.length < 4) return e;
  let n = 0, s = 0;
  for (let o = 1; o < e.length; o++) {
    const l = Math.hypot(e[o][0] - e[0][0], e[o][1] - e[0][1]);
    l > s && (s = l, n = o);
  }
  const i = ye(e.slice(0, n + 1), t), r = ye([...e.slice(n), e[0]], t);
  let a = [...i.slice(0, -1), ...r.slice(0, -1)];
  for (let o = !0; o && a.length > 3; ) {
    o = !1;
    for (let l = 0; l < a.length; l++) {
      const h = a[(l - 1 + a.length) % a.length], c = a[(l + 1) % a.length];
      if (Math.hypot(h[0] - c[0], h[1] - c[1]) < t * 3 && Math.hypot(a[l][0] - h[0], a[l][1] - h[1]) > t * 3 || Dt(a[l], h, c) < t) {
        a = a.filter((p, f) => f !== l), o = !0;
        break;
      }
    }
  }
  return a;
}
function Xn(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const [s, i] = e[n], [r, a] = e[(n + 1) % e.length];
    t += s * a - r * i;
  }
  return Math.abs(t) / 2;
}
function Jn(e, t = 2) {
  const n = Vn(e, t), { w: s, h: i } = n, { label: r, anzahl: a } = Kn(n), o = new Int32Array(a), l = new Uint8Array(a), h = new Int32Array(a);
  for (let x = 0; x < s * i; x++) {
    const _ = r[x];
    if (_ < 0) continue;
    o[_]++, n.dunkel[x] && h[_]++;
    const A = x % s, S = x / s | 0;
    (A === 0 || S === 0 || A === s - 1 || S === i - 1) && (l[_] = 1);
  }
  const c = s * i * 0.015, d = [];
  for (let x = 0; x < a; x++)
    l[x] || o[x] < c || h[x] > o[x] * 0.3 || d.push(x);
  const p = Math.max(2, Math.hypot(s, i) * 6e-3), f = [], b = /* @__PURE__ */ new Map();
  for (const x of d) {
    const _ = qn(Gn(r, s, i, x), p);
    _.length < 3 || (b.set(x, f.length), f.push({ punkte: _.map(([A, S]) => [(A + 0.5) * t, (S + 0.5) * t]), flaeche_px: Xn(_) * t * t }));
  }
  const g = Math.max(4, Math.round(16 / t)), $ = Math.max(6, Math.round(40 / t)), z = Math.max(2, Math.round(6 / t)), M = [];
  return f.forEach((x, _) => {
    const A = x.punkte.map(([S, H]) => [S / t, H / t]);
    A.forEach((S, H) => {
      const N = A[(H + 1) % A.length], L = Math.hypot(N[0] - S[0], N[1] - S[1]);
      if (L < $) return;
      const [Se, Ae] = [(N[0] - S[0]) / L, (N[1] - S[1]) / L], [Ke, Ge] = [-Ae, Se];
      let I = -1;
      const qe = (E) => {
        if (I >= 0 && E - I >= $ && I > 2 && E < L - 2) {
          const C = (I + E) / 2;
          let J = null;
          for (const Z of [1, -1]) {
            const U = Math.round(S[0] + Se * C + Ke * Z * g * 2.5), F = Math.round(S[1] + Ae * C + Ge * Z * g * 2.5);
            if (U < 0 || F < 0 || U >= s || F >= i) continue;
            const ge = b.get(r[F * s + U]);
            ge !== void 0 && ge !== _ && (J = ge);
          }
          M.push({ raum: _, kante: H, von_px: I * t, bis_px: E * t, partner: J });
        }
        I = -1;
      };
      for (let E = 0; E <= L; E++) {
        let C = !1, J = 0;
        for (let Z = -g; Z <= g && !C; Z++) {
          const U = Math.round(S[0] + Se * E + Ke * Z), F = Math.round(S[1] + Ae * E + Ge * Z);
          J = U >= 0 && F >= 0 && U < s && F < i && n.dunkel[F * s + U] ? J + 1 : 0, J >= z && (C = !0);
        }
        !C && I < 0 && (I = E), C && I >= 0 && qe(E);
      }
      qe(L);
    });
  }), { breite: e.width, hoehe: e.height, raeume: f, luecken: M };
}
function ee(e) {
  const t = e.map((s) => s[0]), n = e.map((s) => s[1]);
  return { x0: Math.min(...t), y0: Math.min(...n), x1: Math.max(...t), y1: Math.max(...n) };
}
function vt(e, t, n, s = [0, 0]) {
  const i = e.raeume[t], r = ee(i.punkte), a = ([b, g]) => [Math.round((b - r.x0) * n + s[0]), Math.round((r.y1 - g) * n + s[1])];
  let o = i.punkte.map(a);
  const l = i.punkte.map((b, g) => g);
  let h = 0;
  o.forEach((b, g) => {
    b[0] + b[1] < o[h][0] + o[h][1] && (h = g);
  }), o = [...o.slice(h), ...o.slice(0, h)];
  const c = [...l.slice(h), ...l.slice(0, h)], d = o.length, p = [];
  e.luecken.forEach((b, g) => {
    if (b.raum !== t) return;
    const $ = c.indexOf(b.kante);
    if ($ < 0) return;
    const z = o[$], M = o[($ + 1) % d], x = Math.hypot(M[0] - z[0], M[1] - z[1]), _ = Math.max(0, Math.round(b.von_px * n)), A = Math.min(Math.floor(x), Math.round(b.bis_px * n));
    A - _ >= 30 && p.push({ kante: $, von: _, bis: A, luecke: g });
  });
  const f = { x: Math.round(r.x0 * n - s[0]), y: Math.round((e.hoehe - r.y1) * n - s[1]), winkel: 0 };
  return { umriss: o, haus: f, luecken: p };
}
var Yn = Object.defineProperty, Qn = Object.getOwnPropertyDescriptor, w = (e, t, n, s) => {
  for (var i = s > 1 ? void 0 : s ? Qn(t, n) : t, r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (i = (s ? a(t, n, i) : a(i)) || i);
  return s && i && Yn(t, n, i), i;
};
const R = "raumzonen", es = 5, D = 12, ts = 8, ns = 30, xt = [1, 3, 8, 12, 24], ss = ["auswahl", "umriss", "oeffnung"], W = "anwesenheit", kt = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" }
], is = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung."
};
function wt(e, t) {
  try {
    const n = localStorage.getItem(e);
    return n === null ? t : n === "1";
  } catch {
    return t;
  }
}
function yt(e, t) {
  try {
    localStorage.setItem(e, t ? "1" : "0");
  } catch {
  }
}
function zt(e, t) {
  const n = e[t], s = e[(t + 1) % e.length];
  return Math.hypot(s[0] - n[0], s[1] - n[1]);
}
function _t(e) {
  return (e / 100).toFixed(2).replace(".", ",");
}
function le(e) {
  return `var(--rz-${e})`;
}
function rs(e) {
  return e.map((t) => `${t[0].toFixed(1)},${t[1].toFixed(1)}`).join(" ");
}
function as(e) {
  for (const t of [10, 20, 50, 100, 200, 500, 1e3, 2e3]) if (t >= e) return t;
  return 5e3;
}
let k = class extends ce {
  constructor() {
    super(...arguments), this.narrow = !1, this.raumId = "", this.zones = [], this.sensor = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 }, this.umriss = [], this.oeffnungen = [], this.selVertex = -1, this.selOpening = -1, this.openingDraft = null, this.selected = -1, this.sensorOpen = !1, this.tab = "zonen", this.tool = "auswahl", this.draft = [], this.rectDraft = null, this.hover = null, this.view = { cx: 0, cy: 250, scale: 0.8 }, this.size = { w: 800, h: 600 }, this.heatMin = 0, this.auswStunden = 8, this.auswLaedt = !1, this.auswFehler = "", this.wiz = null, this.plan = null, this.planLaedt = !1, this.planBilder = {}, this.zeigePlan = wt("raumzonen-zeige-plan", !0), this.masse = wt("raumzonen-masse", !1), this.stockwerk = "", this.hausExtra = {}, this.neuRaum = null, this.profilStunden = 0, this.profilLaedt = !1, this.auswFigur = "", this.layersOpen = !1, this.layers = { figuren: !0, spuren: !0, ziele: !1, abdeckung: !0 }, this.dirty = !1, this.zonesFollow = !0, this.saving = !1, this.error = "", this.toast = "", this.page = "raum", this.lagen = {}, this.tueren = {}, this.hausLive = {}, this.hausSel = "", this.aufnahme = !0, this.melder = [], this.nachlauf = 0, this.aufnahmeTage = 30, this.history = new kn(), this.drag = null, this.liveRoom = "", this.viewTouched = !1, this.sensorAnchor = null, this.hausUnsubs = [], this.fit = () => {
      const e = this.sensor, t = [[e.x, e.y]];
      if (this.page === "haus" && this.data) {
        t.length = 0;
        for (const d of this.hausRaeume()) {
          const p = this.lagen[d.id];
          p && t.push(...this.outlineOf(d).map((f) => O(f, p)));
        }
      }
      for (const d of this.zones) t.push(...V(d.form));
      t.push(...this.umriss), t.length < 4 && this.page === "raum" && t.push(...ot([e.x, e.y], e.winkel, Math.min(e.reichweite_cm, 500), e.oeffnung_grad, 8));
      const n = t.map((d) => d[0]), s = t.map((d) => d[1]), [i, r, a, o] = [Math.min(...n), Math.max(...n), Math.min(...s), Math.max(...s)], l = Math.max(200, r - i), h = Math.max(200, o - a), c = Math.min(this.size.w / (l * 1.2), this.size.h / (h * 1.2));
      this.view = { cx: (i + r) / 2, cy: (a + o) / 2, scale: Math.max(0.05, Math.min(5, c)) };
    }, this.undo = () => {
      const e = this.history.undo();
      e && (this.zones = e.zones, this.sensor = e.sensor, this.umriss = e.umriss, this.oeffnungen = e.oeffnungen ?? [], this.selVertex = -1, this.selOpening = -1, this.selected >= this.zones.length && (this.selected = -1), this.dirty = !0);
    }, this.finishDraft = () => {
      if (this.draft.length >= 3)
        if (this.tool === "umriss")
          this.remember(), this.umriss = this.draft, this.oeffnungen = [], this.selOpening = -1, this.dirty = !0;
        else {
          const e = { art: "vieleck", punkte: this.draft }, t = Le(e);
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
        this.error = `Laden fehlgeschlagen: ${P(e)}`;
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
      this.sensor = { x: i.x, y: i.y, winkel: i.winkel, reichweite_cm: i.reichweite_cm, oeffnung_grad: i.oeffnung_grad }, this.aufnahme = s.aufnahme ?? !0, this.aufnahmeTage = s.aufnahme_tage ?? 30, this.melder = [...s.melder ?? []], this.nachlauf = s.melder_nachlauf_s ?? 0, n && (window.clearInterval(this.wizTimer), this.wizLaden()), s.art === "melder" && (this.tab === "zonen" && (this.tab = "raum"), this.kandidaten || this.loadKandidaten());
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
      this.ausw = void 0, this.auswFehler = s.code === "off" ? "off" : `Auswertung fehlgeschlagen: ${P(n)}`;
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
    const e = this.istMelder, t = e ? this.melder.length ? "" : "Mindestens einen Melder wählen." : _n(this.zones);
    if (t) {
      this.showToast(t);
      return;
    }
    this.saving = !0, this.error = "";
    try {
      await this._hass.callWS({
        type: `${R}/room/save`,
        raum_id: this.raumId,
        zonen: e ? [] : this.zones,
        ...e ? { melder: this.melder, melder_nachlauf_s: this.nachlauf } : { sensor: this.sensor },
        umriss: this.umriss,
        oeffnungen: Pn(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage
      }), this.dirty = !1, this.showToast("Gespeichert."), await this.unsubscribeLive(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load();
    } catch (n) {
      this.showToast(`Nicht gespeichert: ${P(n)}`);
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
        for (const n of e.zonen) t.push(Mn(n, t, this.data.vorlagen));
        this.zones = t, this.dirty = !0, this.showToast(`${e.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
      } catch (e) {
        this.showToast(`Konverter-Zonen nicht lesbar: ${P(e)}`);
      }
  }
  // -- Hausplan -------------------------------------------------------------
  outlineOf(e) {
    return e.art === "melder" && e.umriss.length < 3 ? [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300]
    ] : vn(
      e.umriss,
      e.zonen.map((t) => t.form),
      [e.sensor.x, e.sensor.y]
    );
  }
  openHaus(e = !1) {
    if (!this.data || !e && this.page === "haus" || !e && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const t = this.data.raeume;
    this.lagen = xn(
      t.map((i) => ({
        id: i.id,
        outline: this.outlineOf(i),
        lage: i.haus_gesetzt ? { x: i.haus_x, y: i.haus_y, winkel: i.haus_winkel } : null
      }))
    );
    const n = {};
    for (const i of t) for (const r of oe(i)) n[r.key] = r.ziel;
    this.tueren = n;
    const s = this.page === "haus";
    this.page = "haus", this.hausSel = "", this.hausExtra = {}, this.tool = "auswahl", this.dirty = !1, this.unsubscribeLive(), this.subscribeHaus(), s || (this.viewTouched = !1, this.fit());
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
    e && (window.clearInterval(this.wizTimer), this.wiz = { ...e, fehler: void 0, messung: { bis: Date.now() + ts * 1e3, punkte: [], hinweis: "" } }, this.wizTimer = window.setInterval(() => {
      const t = this.wiz;
      if (!t?.messung) return;
      const { punkt: n, hinweis: s } = this.wizPerson(), i = n ? [...t.messung.punkte, n] : t.messung.punkte;
      if (Date.now() < t.messung.bis) {
        this.wiz = { ...t, messung: { ...t.messung, punkte: i, hinweis: s } };
        return;
      }
      window.clearInterval(this.wizTimer);
      const r = jn(i);
      if (!r || i.length < 8) {
        this.wiz = { ...t, messung: void 0, fehler: s || "Zu wenig gesehen. Noch einmal versuchen." };
        return;
      }
      if (r.streuung_cm > ns) {
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
      const i = t.raum.map((o, l) => l === s ? e : o), r = i.every(Boolean), a = r ? $t(i) : "";
      this.wiz = { ...t, raum: i, messung: void 0, aktiv: r ? 0 : s + 1, schritt: r && !a ? "umhaengen" : "vorher", fehler: a || void 0 }, a && (this.wiz = { ...this.wiz, raum: [null, null, null], aktiv: 0 });
    } else {
      const i = t.sensor.map((r, a) => a === s ? Ht(e, n) : r);
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
    const n = e.raum, s = $t(n), i = Fn(e.sensor, n);
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
    try {
      let t = e;
      if (e.type === "application/pdf" || e.name.toLowerCase().endsWith(".pdf")) {
        const d = Wn(new Uint8Array(await e.arrayBuffer()));
        if (!d) throw new Error("Im PDF ist kein Bild des Grundrisses.");
        t = new Blob([d.slice()], { type: "image/jpeg" });
      }
      const n = await createImageBitmap(t), s = Math.min(1, 4e3 / Math.max(n.width, n.height)), i = document.createElement("canvas");
      i.width = Math.round(n.width * s), i.height = Math.round(n.height * s);
      const r = i.getContext("2d");
      r.drawImage(n, 0, 0, i.width, i.height);
      const a = r.getImageData(0, 0, i.width, i.height), o = Jn({ width: a.width, height: a.height, data: a.data }), l = {};
      o.luecken.forEach((d, p) => l[p] = d.partner !== null ? "tuer" : "fenster");
      const h = i.toDataURL("image/jpeg", 0.85).split(",")[1], c = e.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Grundriss";
      this.plan = { bild: URL.createObjectURL(t), g: o, zuordnung: o.raeume.map(() => ""), art: l, massRaum: 0, massSeite: "breite", massM: 0, jpeg: h, name: c, strecke: [], streckeM: 0 };
    } catch (t) {
      this.showToast(`Grundriss nicht gelesen: ${P(t)}`);
    } finally {
      this.planLaedt = !1;
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
    const t = ee(e.g.raeume[e.massRaum].punkte), n = e.massSeite === "breite" ? t.x1 - t.x0 : t.y1 - t.y0;
    return n > 0 ? e.massM * 100 / n : 0;
  }
  async planUebernehmen() {
    const e = this.plan, t = this.planCmProPx();
    if (!e || !t || !this._hass || !this.data) return;
    const n = this.data.raeume, s = e.g.raeume.map((l, h) => h).filter((l) => e.zuordnung[l]).map((l) => {
      const h = n.find((f) => f.id === e.zuordnung[l]), c = h.umriss.length >= 3 ? h.umriss : h.zonen.length ? [...h.zonen.flatMap((f) => V(f.form)), [h.sensor.x, h.sensor.y]] : [], d = vt(e.g, l, t);
      let p = [0, 0];
      if (c.length) {
        const f = ee(c), b = ee(d.umriss);
        p = [Math.round((f.x0 + f.x1 - b.x0 - b.x1) / 2), Math.round((f.y0 + f.y1 - b.y0 - b.y1) / 2)];
      }
      return { i: l, raum: h, u: vt(e.g, l, t, p) };
    }), i = n.filter((l) => l.haus_gesetzt && this.aufStockwerk(l) && !s.some((h) => h.raum.id === l.id)), r = (l) => ee(l);
    let a = 0;
    if (i.length) {
      const l = r(i.flatMap((d) => this.outlineOf(d).map((p) => O(p, { x: d.haus_x, y: d.haus_y, winkel: d.haus_winkel })))), h = s.length ? r(s.flatMap((d) => d.u.umriss.map((p) => O(p, d.u.haus)))) : { x0: 0, y0: 0, x1: e.g.breite * t, y1: e.g.hoehe * t };
      h.x0 < l.x1 && h.x1 > l.x0 && h.y0 < l.y1 && h.y1 > l.y0 && (a = l.x1 + 200 - h.x0);
    }
    const o = s.map(({ i: l, raum: h, u: c }) => ({
      raum_id: h.id,
      ...this.stockwerk && !(h.stockwerke ?? []).length ? { stockwerke: [this.stockwerk] } : {},
      umriss: c.umriss,
      haus: { x: c.haus.x + a, y: c.haus.y, winkel: 0 },
      oeffnungen: c.luecken.filter((d) => e.art[d.luecke] !== "fenster").map((d) => {
        const p = e.g.luecken[d.luecke].partner, f = p !== null ? e.zuordnung[p] || "" : "aussen";
        return { kante: d.kante, von: d.von, bis: d.bis, art: e.art[d.luecke] === "offen" ? "offen" : "tuer", fuehrt_zu: f === h.id ? "" : f };
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
      this.showToast(`Nicht übernommen: ${P(l)}`);
    } finally {
      this.saving = !1;
    }
  }
  async loadKandidaten() {
    if (!(!this._hass || !this.kannAendern))
      try {
        this.kandidaten = await this._hass.callWS({ type: `${R}/kandidaten/get` });
      } catch (e) {
        this.showToast(`Geräte nicht geladen: ${P(e)}`);
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
        const t = { type: `${R}/room/create`, name: e.name.trim(), art: e.art };
        e.bereich_id && (t.bereich_id = e.bereich_id), e.art === "melder" ? t.melder = e.melder ?? [] : t.device_id = e.device_id, await this._hass.callWS(t), this.neuRaum = null, this.showToast(`Raum „${e.name.trim()}“ angelegt. Jetzt im Plan an seinen Platz ziehen.`), await this.unsubscribeHaus(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load(), this.viewTouched = !1, this.fit(), await this.loadKandidaten();
      } catch (t) {
        this.showToast(`Nicht angelegt: ${P(t)}`);
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
        await this._hass.callWS({ type: `${R}/room/delete`, raum_id: e.id }), this.dirty = !1, this.showToast(`Raum „${e.name}“ gelöscht.`), await this.unsubscribeLive(), await new Promise((t) => window.setTimeout(t, 1500)), this.page = "haus", await this.load();
      } catch (t) {
        this.showToast(`Nicht gelöscht: ${P(t)}`);
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
        const e = new Map(this.data.raeume.flatMap((n) => oe(n)).map((n) => [n.key, n])), t = Object.entries(this.tueren).filter(([n, s]) => e.has(n) && e.get(n).ziel !== s).map(([n, s]) => {
          const i = e.get(n);
          return i.oeffnung !== void 0 ? { raum_id: i.raumId, oeffnung: i.oeffnung, fuehrt_zu: s || null } : { raum_id: i.raumId, zone_id: i.zoneId, fuehrt_zu: s || null };
        });
        await this._hass.callWS({
          type: `${R}/haus/save`,
          raeume: Object.entries(this.lagen).map(([n, s]) => ({ raum_id: n, x: Math.round(s.x), y: Math.round(s.y), winkel: s.winkel, ...this.hausExtra[n] ?? {} })),
          tueren: t
        }), this.dirty = !1, this.hausExtra = {}, this.showToast("Hausplan gespeichert."), await this.unsubscribeHaus(), await new Promise((n) => window.setTimeout(n, 1500)), await this.load();
      } catch (e) {
        this.showToast(`Nicht gespeichert: ${P(e)}`);
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
  toScreen([e, t]) {
    const { cx: n, cy: s, scale: i } = this.view;
    return [this.size.w / 2 + (e - n) * i, this.size.h / 2 - (t - s) * i];
  }
  screenPoints(e) {
    return rs(e.map((t) => this.toScreen(t)));
  }
  toWorld(e) {
    const n = this.renderRoot.querySelector("svg.plan")?.getBoundingClientRect() ?? { left: 0, top: 0 }, { cx: s, cy: i, scale: r } = this.view;
    return [s + (e.clientX - n.left - this.size.w / 2) / r, i - (e.clientY - n.top - this.size.h / 2) / r];
  }
  snapped(e) {
    return un(e, es);
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
    n[e] = Sn(n[e], t, this.data.vorlagen), this.zones = n, this.dirty = !0;
  }
  addZone(e) {
    this.data && (this.remember(), this.zones = [...this.zones, wn(e, this.zones, this.data.vorlagen)], this.select(this.zones.length - 1), this.dirty = !0);
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
    const [e, t] = De(this.sensor.winkel), n = 46 / this.view.scale;
    return [this.sensor.x + e * n, this.sensor.y + t * n];
  }
  near(e, t, n = D) {
    return He(this.toScreen(e), this.toScreen(t)) <= n;
  }
  zoneAt(e) {
    for (let t = this.zones.length - 1; t >= 0; t--) if (Te(e, this.zones[t].form)) return t;
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
      const h = this.wallAt(n, D * 2);
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
      h < 0 || this.zones[h].form.art !== "zellen" ? (this.addZone({ art: "zellen", groesse: cn, zellen: [] }), h = this.zones.length - 1) : this.remember();
      const c = this.zones[h].form, [d, p] = Ve(n, c.groesse, c.x0 ?? 0, c.y0 ?? 0), f = !c.zellen.some(([b, g]) => b === d && g === p);
      this.drag = { kind: "paint", add: f }, this.updateZone(h, { form: ht(c, n, f) });
      return;
    }
    const i = this.oeffnungen[this.selOpening];
    if (i && this.umriss.length >= 3) {
      const [h, c] = re(this.umriss, i);
      for (const [d, p] of [["von", h], ["bis", c]])
        if (this.near(n, p, D + 4)) {
          this.remember(), this.drag = { kind: "opening-end", index: this.selOpening, ende: d };
          return;
        }
    }
    const r = this.openingAt(n);
    if (r >= 0 && r === this.selOpening) {
      const h = this.oeffnungen[r];
      this.remember(), this.drag = { kind: "opening-move", index: r, start: ue(this.umriss, h.kante, n), von: h.von, bis: h.bis };
      return;
    }
    const a = this.zones[this.selected];
    if (a && a.form.art !== "zellen" && this.near(n, this.zoneRotateHandle(a.form))) {
      this.remember();
      const h = T(a.form);
      this.drag = { kind: "rotate-zone", center: h, start: Ee(h, n), anchor: a.form };
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
      const c = Y(a.form.punkte).findIndex((d) => this.near(n, d));
      if (c >= 0) {
        this.remember(), this.updateZone(this.selected, { form: lt(a.form, c, this.snapped(Y(a.form.punkte)[c])) }), this.selVertex = c + 1, this.drag = { kind: "vertex", index: c + 1 };
        return;
      }
    } else if (a?.form.art === "rechteck") {
      const h = a.form, c = ve(h.mitte, h.breite, h.tiefe, h.winkel).findIndex((d) => this.near(n, d));
      if (c >= 0) {
        this.remember(), this.drag = { kind: "corner", index: c };
        return;
      }
    }
    if (!this.istMelder && this.near(n, this.sensorHandle(), D + 2)) {
      this.remember(), this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones }, this.drag = { kind: "sensor-rotate" }, this.openSensor();
      return;
    }
    if (!this.istMelder && this.near(n, [this.sensor.x, this.sensor.y], D + 4)) {
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
      const h = Y(this.umriss).findIndex((d) => this.near(n, d));
      if (h >= 0) {
        this.remember();
        const d = this.umriss.slice();
        d.splice(h + 1, 0, this.snapped(Y(this.umriss)[h])), this.oeffnungen = mt(this.oeffnungen, { inserted: h }, this.umriss.length), this.umriss = d, this.dirty = !0, this.drag = { kind: "umriss-vertex", index: h + 1 };
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
      this.remember(), this.updateZone(e, { form: zn(n.form, t) }), this.selVertex = -1;
    }
  }
  deleteWallCorner(e) {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember(), this.oeffnungen = mt(this.oeffnungen, { removed: e }, this.umriss.length), this.umriss = this.umriss.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0;
  }
  changeOpening(e, t) {
    this.remember(), this.oeffnungen = this.oeffnungen.map((n, s) => s === e ? { ...n, ...t } : n), this.dirty = !0;
  }
  deleteOpening(e) {
    confirm("Diese Öffnung in der Wand löschen?") && (this.remember(), this.oeffnungen = this.oeffnungen.filter((t, n) => n !== e), this.selOpening = -1, this.dirty = !0);
  }
  turnZone(e, t) {
    const n = this.zones[e];
    !n || n.form.art === "zellen" || (this.remember(), this.updateZone(e, { form: pt(n.form, T(n.form), t) }));
  }
  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  wallAt(e, t = D) {
    const n = this.umriss.length;
    if (n < 3) return -1;
    let s = -1, i = t;
    for (let r = 0; r < n; r++) {
      const a = Pe(this.toScreen(e), this.toScreen(this.umriss[r]), this.toScreen(this.umriss[(r + 1) % n]));
      a <= i && (s = r, i = a);
    }
    return s;
  }
  openingAt(e) {
    return this.oeffnungen.findIndex((t) => {
      const [n, s] = re(this.umriss, t);
      return Pe(this.toScreen(e), this.toScreen(n), this.toScreen(s)) <= D;
    });
  }
  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  zoneRotateHandle(e) {
    const t = T(e), n = Math.max(...V(e).map((s) => s[1]));
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
        i && this.updateZone(this.selected, { form: yn(i.form, s.index, n) });
        break;
      case "corner":
        i?.form.art === "rechteck" && this.updateZone(this.selected, { form: An(i.form, s.index, n) });
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
          this.updateZone(this.selected, { form: Ie(i.form, l * o, h * o) }), this.drag = { kind: "zone", last: [s.last[0] + l * o, s.last[1] + h * o] };
        } else (r || a) && (this.updateZone(this.selected, { form: Ie(i.form, r, a) }), this.drag = { kind: "zone", last: n });
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: n[0], y: n[1] });
        break;
      case "sensor-rotate": {
        let r = Ee([this.sensor.x, this.sensor.y], t);
        e.shiftKey || (r = Math.round(r / 5) * 5), r <= -180 && (r += 360), this.moveSensor({ ...this.sensor, winkel: r });
        break;
      }
      case "paint":
        i?.form.art === "zellen" && this.updateZone(this.selected, { form: ht(i.form, t, s.add) });
        break;
      case "rect":
        this.rectDraft = [s.start, n];
        break;
      case "opening": {
        this.openingDraft = En(this.umriss, s.kante, s.start, t);
        break;
      }
      case "opening-end": {
        const r = this.oeffnungen[s.index];
        if (!r) break;
        const a = zt(this.umriss, r.kante), o = Math.max(0, Math.min(Math.floor(a), Math.round(ue(this.umriss, r.kante, t) / 5) * 5)), l = s.ende === "von" ? { ...r, von: Math.min(o, r.bis - 20) } : { ...r, bis: Math.max(o, r.von + 20) };
        this.oeffnungen = this.oeffnungen.map((h, c) => c === s.index ? l : h), this.dirty = !0;
        break;
      }
      case "opening-move": {
        const r = this.oeffnungen[s.index];
        if (!r) break;
        const a = Math.floor(zt(this.umriss, r.kante)), o = s.bis - s.von;
        let l = Math.round((s.von + ue(this.umriss, r.kante, t) - s.start) / 5) * 5;
        l = Math.max(0, Math.min(a - o, l)), l !== r.von && (this.oeffnungen = this.oeffnungen.map((h, c) => c === s.index ? { ...r, von: l, bis: l + o } : h), this.dirty = !0);
        break;
      }
      case "rotate-zone": {
        let r = Ee(s.center, t) - s.start;
        e.shiftKey || (r = Math.round(r / 5) * 5), this.updateZone(this.selected, { form: pt(s.anchor, s.center, r) });
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
    this.zonesFollow && t && (this.zones = t.zones.map((n) => ({ ...n, form: bn(n.form, t.sensor, e) }))), this.dirty = !0;
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
      this.rectDraft = null, Math.abs(t[0] - n[0]) >= 10 && Math.abs(t[1] - n[1]) >= 10 && (this.addZone(ct(t, n)), this.tool = "auswahl");
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
      if (Pe(this.toScreen(n), this.toScreen(s[i]), this.toScreen(s[(i + 1) % s.length])) <= D) {
        this.remember(), this.updateZone(this.selected, { form: lt(t.form, i, this.snapped(n)) });
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
      const [c] = this.toScreen([h, 0]);
      l.push(v`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1=${c} y1="0" x2=${c} y2=${t} />`);
    }
    for (let h = Math.floor(r / o) * o; h <= a; h += o) {
      const [, c] = this.toScreen([0, h]);
      l.push(v`<line class="grid ${h % 100 === 0 ? "major" : ""}" x1="0" y1=${c} x2=${e} y2=${c} />`);
    }
    return v`<g>${l}</g>`;
  }
  renderRoom() {
    if (this.umriss.length < 3) return m;
    const e = this.screenPoints(this.umriss), t = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen, n = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen, s = T({ art: "vieleck", punkte: this.umriss }), i = this.istMelder && !!this.live?.zonen[W]?.belegt;
    return v`<polygon class="floor ${i ? "belegt" : ""}" points=${e} />
      <polygon class="wall" points=${e} />
      ${n.map((r, a) => this.renderOpening(r, a === this.selOpening || r === this.openingDraft, s))}
      ${this.kannAendern && this.tool === "auswahl" && this.oeffnungen[this.selOpening] ? re(this.umriss, this.oeffnungen[this.selOpening]).map((r) => {
      const [a, o] = this.toScreen(r);
      return v`<circle class="handle opening-griff" cx=${a} cy=${o} r="8" />`;
    }) : m}
      ${t ? v`${this.umriss.map((r) => {
      const [a, o] = this.toScreen(r);
      return v`<circle class="handle" cx=${a} cy=${o} r="5" />`;
    })}
          ${Y(this.umriss).map((r) => this.renderPlus(r))}` : m}`;
  }
  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  renderOpening(e, t, n) {
    const [s, i] = re(this.umriss, e), [r, a] = this.toScreen(s), [o, l] = this.toScreen(i), h = v`<line class="wall-gap" x1=${r} y1=${a} x2=${o} y2=${l} />`;
    if (e.art === "offen")
      return v`<g class="opening ${t ? "selected" : ""}">${h}<line class="opening-line" x1=${r} y1=${a} x2=${o} y2=${l} /></g>`;
    const [c, d, p, f] = e.anschlag === "ende" ? [o, l, r, a] : [r, a, o, l], b = Math.hypot(p - c, f - d) || 1;
    let g = -(f - d) / b, $ = (p - c) / b;
    const [z, M] = this.toScreen(n);
    (z - c) * g + (M - d) * $ >= 0 !== (e.aufgehen !== "aussen") && (g = -g, $ = -$);
    const _ = c + g * b, A = d + $ * b, S = (p - c) * $ - (f - d) * g > 0 ? 0 : 1;
    return v`<g class="opening ${t ? "selected" : ""}">${h}
      <line class="door-leaf" x1=${c} y1=${d} x2=${_} y2=${A} />
      <path class="door-arc" d="M ${_} ${A} A ${b} ${b} 0 0 ${S} ${p} ${f}" /></g>`;
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
      return { key: `a|${e.bis}|${e.stunden}|${this.auswFigur}`, zellen: bt(t.map((n) => n.zellen)), zelle: e.zelle_cm, sigma: 8 };
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
      const i = gt(e.zellen, e.zelle, e.sigma);
      if (!i) return m;
      const r = document.createElement("canvas");
      r.width = i.nx, r.height = i.ny;
      const a = r.getContext("2d");
      if (!a) return m;
      a.putImageData(new ImageData(In(i, this.heatRgb()), i.nx, i.ny), 0, 0), t = { key: e.key, href: r.toDataURL(), x0: i.x0, y0: i.y0, w: i.nx * i.zelle, h: i.ny * i.zelle }, this.heatBildCache = t;
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
      const [a, o] = this.toScreen(i), l = r === e.aktiv && e.schritt === "nachher";
      return v`<g class="wiz-marke ${l ? "aktiv" : ""}"><circle cx=${a} cy=${o} r="14" /><text x=${a} y=${o + 5}>${r + 1}</text></g>`;
    }), n = e.ergebnis;
    let s = m;
    if (n) {
      const [i, r] = this.toScreen([n.x, n.y]), a = Math.max(30, this.px(80)), [o, l] = De(n.winkel);
      s = v`<g class="wiz-neu"><circle cx=${i} cy=${r} r="9" /><line x1=${i} y1=${r} x2=${i + o * a} y2=${r - l * a} /></g>`;
    }
    return v`${t}${s}`;
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
    let e = (this.data?.plaene ?? []).filter((n) => this.planBilder[n.id]);
    if (this.page === "haus" && this.stockwerk && (e = e.filter((n) => !n.stockwerk || n.stockwerk === this.stockwerk)), this.page === "raum" && this.raum) {
      const n = this.stockwerkeVon(this.raum);
      n.length && (e = e.filter((s) => !s.stockwerk || n.includes(s.stockwerk)));
    }
    if (!e.length) return m;
    let t = null;
    if (this.page === "raum") {
      const n = this.raum;
      if (!n?.haus_gesetzt) return m;
      const s = { x: n.haus_x, y: n.haus_y, winkel: n.haus_winkel };
      t = (i) => $n(i, s);
    }
    return v`${e.map((n) => {
      const s = n.cm_pro_px, i = (c, d) => [n.x + c * s, n.y + (n.hoehe_px - d) * s], r = (c, d) => this.toScreen(t ? t(i(c, d)) : i(c, d)), [a, o, l] = [r(0, 0), r(1, 0), r(0, 1)], h = [o[0] - a[0], o[1] - a[1], l[0] - a[0], l[1] - a[1], a[0], a[1]].map((c) => c.toFixed(5)).join(" ");
      return v`<image class="plan-hintergrund" href=${this.planBilder[n.id]} x="0" y="0" width=${n.breite_px} height=${n.hoehe_px} transform="matrix(${h})" preserveAspectRatio="none" />`;
    })}`;
  }
  /** Maße der Wände (und Öffnungen), wenn eingeschaltet. */
  renderMasse() {
    if (!this.masse || this.umriss.length < 3) return m;
    const e = this.umriss.length, t = T({ art: "vieleck", punkte: this.umriss }), n = this.umriss.map((i, r) => {
      const a = this.umriss[(r + 1) % e], o = Math.hypot(a[0] - i[0], a[1] - i[1]);
      if (o < 20) return m;
      const l = [(i[0] + a[0]) / 2, (i[1] + a[1]) / 2];
      let h = -(a[1] - i[1]) / o, c = (a[0] - i[0]) / o;
      (t[0] - l[0]) * h + (t[1] - l[1]) * c > 0 && ([h, c] = [-h, -c]);
      const [d, p] = this.toScreen(l), f = 26, [b, g] = [d + h * f, p - c * f];
      return v`<text class="mass-text" x=${b} y=${g} dy="0.35em">${_t(o)} m</text>`;
    }), s = this.oeffnungen.map((i) => {
      const [r, a] = re(this.umriss, i), [o, l] = this.toScreen([(r[0] + a[0]) / 2, (r[1] + a[1]) / 2]);
      return v`<text class="mass-text klein" x=${o} y=${l} dy="-0.8em">${_t(i.bis - i.von)}</text>`;
    });
    return v`<g>${n}${s}</g>`;
  }
  /** Melder-Raum: in der Mitte steht, ob jemand da ist. */
  renderMelderLabel() {
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[W]?.belegt, s = this.umriss.length >= 3 ? T({ art: "vieleck", punkte: this.umriss }) : [0, 0], [i, r] = this.toScreen(s);
    return v`<text class="label room" x=${i} y=${r}>${t ? n ? "jemand da" : "niemand" : "Melder nicht erreichbar"}</text>
      ${this.umriss.length < 3 ? v`<text class="label sub" x=${i} y=${r + 18}>Wände zeichnen: Werkzeug links</text>` : m}`;
  }
  renderCoverage() {
    if (!this.layers.abdeckung) return m;
    const e = this.sensor;
    return v`<polygon class="coverage" points=${this.screenPoints(ot([e.x, e.y], e.winkel, e.reichweite_cm, e.oeffnung_grad))} />`;
  }
  renderZone(e, t) {
    const n = (e.id ? this.live?.zonen[e.id]?.belegt : !1) ?? !1, s = ie(e), i = le(s), r = t === this.selected, a = n ? 0.5 : 0.2;
    let o;
    if (e.form.art === "zellen")
      o = v`${We(e.form).map((l) => {
        const [h, c] = this.toScreen([l.x, l.y + l.s]);
        return v`<rect class="zone-shape ${r ? "selected" : ""}" x=${h} y=${c} width=${this.px(l.s)} height=${this.px(l.s)} fill=${i} fill-opacity=${a} stroke=${i} style="stroke-width:1" />`;
      })}`;
    else {
      const l = this.screenPoints(V(e.form)), h = r && e.regel.rand_cm > 0 ? this.px(e.regel.rand_cm * 2) : 0;
      o = v`
        ${h ? v`<mask id="rz-band-${t}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${l} fill="black" />
              </mask>
              <polygon points=${l} fill="none" stroke=${i} stroke-opacity="0.25" stroke-width=${h} stroke-linejoin="round" mask="url(#rz-band-${t})" />` : m}
        <polygon class="zone-shape ${r ? "selected" : ""}" points=${l} fill=${i} fill-opacity=${a} stroke=${i} />`;
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
    e.form.art === "vieleck" ? t = e.form.punkte : e.form.art === "rechteck" && (t = ve(e.form.mitte, e.form.breite, e.form.tiefe, e.form.winkel));
    let n = m;
    if (e.form.art !== "zellen") {
      const [s, i] = this.toScreen(T(e.form)), [r, a] = this.toScreen(this.zoneRotateHandle(e.form));
      n = v`<line class="sensor-line" x1=${s} y1=${i} x2=${r} y2=${a} /><circle class="handle angle" cx=${r} cy=${a} r="8"><title>Drehen</title></circle>`;
    }
    return v`${n}
      ${e.form.art === "vieleck" ? Y(e.form.punkte).map((s) => this.renderPlus(s)) : m}
      ${t.map((s, i) => {
      const [r, a] = this.toScreen(s), o = e.form.art === "vieleck" && i === this.selVertex;
      return v`<rect class="handle ${o ? "on" : ""}" x=${r - 5} y=${a - 5} width="10" height="10" rx="2" />`;
    })}`;
  }
  renderSensor() {
    const e = this.sensor, [t, n] = this.toScreen([e.x, e.y]), [s, i] = this.toScreen(this.sensorHandle()), r = -e.winkel * Math.PI / 180, a = [4.5, 7.5].map((o) => {
      const l = r - Math.PI / 2 - 0.7, h = r - Math.PI / 2 + 0.7;
      return v`<path class="sensor-wave" d="M ${t + o * Math.cos(l)} ${n + o * Math.sin(l)} A ${o} ${o} 0 0 1 ${t + o * Math.cos(h)} ${n + o * Math.sin(h)}" />`;
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
      const s = ct(...this.rectDraft);
      if (s.art !== "rechteck") return m;
      const [i, r] = this.toScreen(s.mitte);
      return v`<polygon class="draft" points=${this.screenPoints(ve(s.mitte, s.breite, s.tiefe, 0))} />
        <text class="label" x=${i} y=${r + 5}>${(s.breite / 100).toFixed(2)} × ${(s.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return m;
    const e = this.hover ? [...this.draft, this.hover] : this.draft, [t, n] = this.toScreen(this.draft[0]);
    return v`<polyline class="draft" points=${this.screenPoints(e)} style="fill:none" />
      ${this.draft.map((s) => {
      const [i, r] = this.toScreen(s);
      return v`<circle class="draft-dot" cx=${i} cy=${r} r="4" />`;
    })}
      ${this.draft.length >= 3 ? v`<circle class="close-ring" cx=${t} cy=${n} r=${D} />` : m}`;
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
      if (i && Te(e, { art: "vieleck", punkte: this.outlineOf(s).map((r) => O(r, i)) })) return s.id;
    }
    return "";
  }
  /** Mitte einer Tür im Haus. */
  renderHausPlan() {
    const e = this.hausRaeume(), t = [], n = [], s = [], i = [];
    for (const r of e) {
      const a = this.lagen[r.id];
      if (!a) continue;
      const o = this.outlineOf(r).map((g) => O(g, a)), l = r.id === this.hausSel, h = this.hausLive[r.id], c = r.art === "melder" && !!h?.zonen[W]?.belegt;
      t.push(v`<polygon class="floor ${c ? "belegt" : ""}" points=${this.screenPoints(o)} />
        <polygon class="wall ${r.umriss.length >= 3 ? "" : "guess"} ${l ? "selected" : ""}" points=${this.screenPoints(o)} />`);
      for (const g of r.zonen) {
        const $ = ie(g);
        if ($ === "ignorieren") continue;
        const z = (g.id ? h?.zonen[g.id]?.belegt : !1) ?? !1, M = V(g.form).map((x) => O(x, a));
        t.push(v`<polygon class="zone-shape" points=${this.screenPoints(M)} fill=${le($)} fill-opacity=${z ? 0.5 : 0.18} stroke=${le($)} />`);
      }
      for (const g of oe(r)) {
        const $ = this.tueren[g.key] ?? "", [z, M] = this.toScreen(O(g.punkt, a));
        if ($ === "aussen")
          s.push(v`<text class="label sub" x=${z} y=${M - 10}>nach draußen</text>`);
        else if ($) {
          const x = e.find((L) => L.id === $);
          if (!x) continue;
          const _ = oe(x).find((L) => this.tueren[L.key] === r.id);
          if (_ && r.id > x.id) continue;
          const A = this.lagen[x.id];
          if (!A) continue;
          const S = O(_ ? _.punkt : T({ art: "vieleck", punkte: this.outlineOf(x) }), A), [H, N] = this.toScreen(S);
          n.push(v`<line class="link" x1=${z} y1=${M} x2=${H} y2=${N} />
            <circle class="link-dot" cx=${z} cy=${M} r="5" /><circle class="link-dot" cx=${H} cy=${N} r="5" />`);
        }
      }
      const [d, p] = this.toScreen(T({ art: "vieleck", punkte: o })), f = h ? h.figuren.filter((g) => !g.tags.includes("wiederhergestellt") && !g.tags.includes("stoerung")).length : 0, b = !h || h.problem || !h.verfuegbar ? "nicht erreichbar" : r.art === "melder" ? c ? "jemand da" : "niemand" : f ? `${f} ${f === 1 ? "Person" : "Personen"}` : "niemand";
      if (s.push(v`<text class="label room" x=${d} y=${p}>${r.name}</text>
        <text class="label sub" x=${d} y=${p + 16}>${b}</text>`), r.art !== "melder")
        for (const g of h?.figuren ?? []) {
          if (g.tags.includes("wiederhergestellt") || g.tags.includes("stoerung")) continue;
          const z = g.tags.includes("hund") || g.art === "pet" ? "var(--rz-tier)" : "var(--rz-person)", [M, x] = this.toScreen(O([g.x, g.y], a)), _ = Math.max(6, this.px(14));
          i.push(v`<circle class="figure ${g.gehalten ? "held" : ""}" cx=${M} cy=${x} r=${_} fill=${z} stroke=${g.gehalten ? z : "var(--card)"} />`);
        }
    }
    return v`${this.renderPlanBilder()}${t}${n}${i}${s}`;
  }
  renderScalebar() {
    const e = as(90 / this.view.scale), t = e >= 100 ? `${e / 100} m` : `${e} cm`;
    return u`<div class="scalebar"><div style="width:${this.px(e)}px"></div>${t}</div>`;
  }
  renderBubble() {
    const e = is[this.tool];
    if (e) {
      const t = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return u`<div class="bubble">
        <ha-icon icon=${kt.find((n) => n.tool === this.tool).icon}></ha-icon>
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
        ${this.page === "haus" ? this.renderHausPlan() : this.istMelder ? v`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderMelderLabel()} ${this.renderDraft()}` : v`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((t, n) => this.renderZone(t, n))} ${this.renderLive()}
              ${this.zones.map((t) => this.renderZoneLabel(t))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()} ${this.renderWizMarken()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(t) => t.stopPropagation()}>
        ${this.kannAendern && this.page === "raum" ? u`${kt.filter((t) => !this.istMelder || ss.includes(t.tool)).map(
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
      this.zeigePlan = !this.zeigePlan, yt("raumzonen-zeige-plan", this.zeigePlan);
    }}
            >
              <ha-icon icon="mdi:image-outline"></ha-icon>
            </button>` : m}
        ${this.page === "raum" ? u`<button
              class="icon ${this.masse ? "on" : ""}"
              title="Maße der Wände"
              aria-label="Maße der Wände"
              @click=${() => {
      this.masse = !this.masse, yt("raumzonen-masse", this.masse);
    }}
            >
              <ha-icon icon="mdi:ruler"></ha-icon>
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
    const n = t === this.selected, s = ie(e), i = xe(s), r = e.id ? this.live?.zonen[e.id] : void 0, a = r ? u`<span class="badge ${r.belegt ? "on" : "off"}">${r.belegt ? r.personen > 1 ? `belegt · ${r.personen}` : "belegt" : "frei"}</span>` : u`<span class="badge new">neu</span>`;
    return u`<li class="item ${n ? "open" : ""}" style="--zone:${le(s)}">
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
    const n = e.regel, s = ie(e), i = this.data.grenzen, r = (h, c, d, p, f) => u`<label class="field"
        >${c}<input
          type="number"
          min="0"
          max=${p}
          step=${f}
          .value=${String(n[h])}
          @change=${(b) => {
      const g = Number(b.target.value);
      Number.isFinite(g) && this.updateRegel(t, { [h]: Math.max(0, Math.min(p, g)) });
    }}
        /><span class="unit">${d}</span></label
      >`, a = (h, c, d, p) => u`<label class="check"
        ><input type="checkbox" .checked=${d} @change=${(f) => p(f.target.checked)} /><span
          >${h}<small>${c}</small></span
        ></label
      >`, o = Le(e.form), l = (this.data?.raeume ?? []).filter((h) => h.id !== this.raumId);
    return this.kannAendern ? u`<div class="inspector">
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
        ${Be.map(
      (h) => u`<button class=${h.rolle === s ? "active" : ""} @click=${() => this.setRolle(t, h.rolle)}>
            <ha-icon icon=${h.icon}></ha-icon>${h.name}
          </button>`
    )}
      </div>
      <p class="hint small">${xe(s).text}</p>
      ${s === "tuer" ? u`<label class="field"
              >Wohin führt die Tür?<select
                @change=${(h) => {
      this.remember(), this.updateZone(t, { fuehrt_zu: h.target.value });
    }}
              >
                <option value="" ?selected=${!e.fuehrt_zu}>weiß nicht</option>
                <option value="aussen" ?selected=${e.fuehrt_zu === "aussen"}>nach draußen / Raum ohne Sensor</option>
                ${l.map((h) => u`<option value=${h.id} ?selected=${e.fuehrt_zu === h.id}>${h.name}</option>`)}
              </select></label
            >
            <p class="hint small">Damit weiß Raumzonen später, wer von wo nach wo geht.</p>` : m}
      ${s === "bett" ? u`${a(
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
    )}` : m}
      ${s !== "ignorieren" ? u`<div class="summary">${dt(e)}</div>
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
            </p>` : m}
      ${o ? u`<div class="note warn">${o}</div>` : m}
      <div class="actions">
        <span class="spacer"></span>
        <button class="text danger" @click=${() => this.deleteZone(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
      </div>
    </div>` : u`<div class="inspector">
        <p class="hint small">${xe(s).text}</p>
        ${s === "tuer" ? u`<div class="summary">Führt ${Rn(e, l)}.</div>` : m}
        ${s !== "ignorieren" ? u`<div class="summary">${dt(e)}</div>` : m}
      </div>`;
  }
  renderZonesTab() {
    return u`
      ${this.zones.length ? u`<ul class="list">
            ${this.zones.map((e, t) => this.renderZoneItem(e, t))}
          </ul>` : u`<p class="hint">${this.kannAendern ? "Noch keine Zonen. Mit den Werkzeugen links am Plan zeichnen, z. B. ein Rechteck über das Bett." : "Noch keine Zonen eingezeichnet."}</p>`}
      ${this.kannAendern ? this.renderNewZone() : m}`;
  }
  renderNewZone() {
    return u`<h3>Neue Zone</h3>
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
    const e = this.live, t = !!e && e.verfuegbar && !e.problem, n = !!e?.zonen[W]?.belegt, s = this.kandidaten, i = (a) => s?.melder.find((o) => o.id === a || o.entity_id === a)?.name ?? a, r = (s?.melder ?? []).filter((a) => !a.benutzt_von || a.benutzt_von === this.raumId || this.melder.includes(a.id));
    return u`<h3>Melder</h3>
      <ul class="list">
        <li class="item">
          <div class="row static">
            <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
            <span class="name">${this.raum?.name}<small>${t ? n ? "jemand da" : "niemand da" : e?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${t ? n ? "on" : "off" : "off unreachable"}" style="--zone:var(--rz-bereich)">${t ? n ? "da" : "leer" : "nicht erreichbar"}</span>
          </div>
        </li>
      </ul>
      ${this.kannAendern ? u`${s ? u`<ul class="melder-liste">
                  ${r.map((a) => {
      const o = this.melder.includes(a.id) || this.melder.includes(a.entity_id);
      return u`<li>
                      <label class="check"
                        ><input
                          type="checkbox"
                          .checked=${o}
                          @change=${(l) => {
        const h = l.target.checked;
        this.melder = h ? [...this.melder, a.id] : this.melder.filter((c) => c !== a.id && c !== a.entity_id), this.dirty = !0;
      }}
                        /><span>${a.name}<small>${this.bereichName(a.bereich_id)}</small></span></label
                      >
                    </li>`;
    })}
                </ul>` : u`<p class="hint">Lädt …</p>`}
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
            </div>` : u`<ul class="doors">
            ${this.melder.map((a) => u`<li class="door"><ha-icon icon="mdi:motion-sensor"></ha-icon><span>${i(a)}</span></li>`)}
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
        </div>`;
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
    else if (e.schritt === "nachher")
      a = e.modus === "einmessen" && e.tippen ? u`<p class="note">Jetzt im Plan antippen, wo du bei Stelle ${t} gestanden bist.</p>
            ${r}` : u`<p class="hint small">
              ${e.modus === "umsetzen" ? u`Stell dich wieder auf Stelle ${t} (im Plan markiert) und tippe auf „Messen“.` : u`Allein im Raum: Stell dich an eine Stelle, die du im Plan gut findest (z. B. Bettecke, Türmitte), und tippe auf „Messen“.
                    Danach tippst du sie im Plan an. Drei Stellen, mindestens 1 m auseinander, nicht auf einer Linie.`}
            </p>
            ${r} ${i(`Stelle ${t} messen`)}`;
    else {
      const o = e.ergebnis, l = o.rest_cm <= 15, h = this.raum.sensor, c = Math.round(Math.hypot(o.x - h.x, o.y - h.y));
      let d = Math.round(((o.winkel - h.winkel) % 360 + 540) % 360 - 180);
      d === -180 && (d = 180);
      const p = d === 0 ? "gleich ausgerichtet" : `um ${Math.abs(d)}° ${d > 0 ? "nach links" : "nach rechts"} gedreht`;
      a = u`<p class="summary">
          ${e.modus === "umsetzen" || c > 0 ? u`Der Sensor hängt jetzt ${c < 10 ? "fast an derselben Stelle" : `${c} cm von der alten Stelle entfernt`} und ist ${p}.` : m}
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
                  <span class="name">${e.art === "tuer" ? "Tür" : "Offen"}<small>${Math.round(e.bis - e.von)} cm breit</small></span>
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
                      <p class="hint small">
                        Breite: die Punkte an den Enden ziehen; verschieben: die Öffnung selbst ziehen. Wohin sie führt, stellst du im Hausplan ein.${this.istMelder ? "" : " Damit Raumzonen „betreten“ und „verlassen“ genau erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor zeichnen."}
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
      const a = r.key, o = this.tueren[a] ?? "", l = e.filter((h) => h.id !== i.id);
      if (!this.kannAendern) {
        const h = o === "aussen" ? "nach draußen" : o ? l.find((c) => c.id === o)?.name ?? "weiß nicht" : "weiß nicht";
        return u`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${r.name}: ${h}</span></li>`;
      }
      return u`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <label class="field"
          >${r.name} führt zu<select
            @change=${(h) => {
        this.tueren = { ...this.tueren, [a]: h.target.value }, this.dirty = !0;
      }}
          >
            <option value="" ?selected=${!o}>weiß nicht</option>
            <option value="aussen" ?selected=${o === "aussen"}>draußen / Raum ohne Raumzonen</option>
            ${l.map((h) => u`<option value=${h.id} ?selected=${o === h.id}>${h.name}</option>`)}
          </select></label
        >
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
        <ul class="list">
          ${e.filter((i) => this.aufStockwerk(i)).map((i) => {
      const r = this.hausLive[i.id], a = r ? r.figuren.filter((p) => !p.tags.includes("wiederhergestellt") && !p.tags.includes("stoerung")).length : 0, o = i.id === this.hausSel, l = oe(i), h = i.art === "melder", c = h ? !!r?.zonen[W]?.belegt : a > 0, d = !!r && r.verfuegbar && !r.problem;
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
                            ${l.map((p) => s(i, p))}
                          </ul>` : u`<p class="hint small">Keine Tür eingezeichnet. Im Raum mit dem Werkzeug „Tür oder Öffnung“ in eine Wand zeichnen${h ? "" : " oder eine Zone mit der Rolle „Tür“ anlegen"}.</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(i.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>` : m}
            </li>`;
    })}
        </ul>
        ${this.kannAendern ? u`${this.renderPlanListe()} ${this.renderProfil()}` : m}
      </div>
    </aside>`;
  }
  renderPlanListe() {
    const e = this.data?.plaene ?? [];
    return e.length ? u`<h3>Grundrisse</h3>
      <ul class="list">
        ${e.map(
      (t) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><ha-icon icon="mdi:image-outline"></ha-icon></span>
              <span class="name">${t.name}<small>${this.planBilder[t.id] ? "im Hintergrund" : "Bild fehlt"}</small></span>
              <button class="text small danger" ?disabled=${this.saving} @click=${() => this.planLoeschen(t)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
            </div>
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
        this.showToast(`Nicht gelöscht: ${P(t)}`);
      } finally {
        this.saving = !1;
      }
    }
  }
  renderPlanImport() {
    const e = this.plan;
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
    const t = this.planCmProPx(), n = this.data?.raeume ?? [], s = (p) => {
      if (!t) return "Größe: erst ein Maß eingeben";
      const f = ee(e.g.raeume[p].punkte), b = (g) => (g / 100).toFixed(1).replace(".", ",");
      return `ca. ${b((f.x1 - f.x0) * t)} × ${b((f.y1 - f.y0) * t)} m`;
    }, i = (p) => this.plan = { ...e, ...p }, r = (p) => T({ art: "vieleck", punkte: p }), a = (p) => {
      const f = p.currentTarget.getBoundingClientRect(), b = [(p.clientX - f.left) / f.width * e.g.breite, (p.clientY - f.top) / f.height * e.g.hoehe];
      i({ strecke: e.strecke.length >= 2 ? [b] : [...e.strecke, b] });
    }, o = e.g.breite / 120, l = v`${e.strecke.length === 2 ? v`<line class="plan-strecke" x1=${e.strecke[0][0]} y1=${e.strecke[0][1]} x2=${e.strecke[1][0]} y2=${e.strecke[1][1]} stroke-width=${o / 1.5} />` : m}${e.strecke.map(([p, f]) => v`<circle class="plan-strecke" cx=${p} cy=${f} r=${o} />`)}`, h = v`<svg class="plan-vorschau" viewBox="0 0 ${e.g.breite} ${e.g.hoehe}" @click=${a}>
      <image href=${e.bild} x="0" y="0" width=${e.g.breite} height=${e.g.hoehe} opacity="0.55" />
      ${e.g.raeume.map((p, f) => {
      const [b, g] = r(p.punkte), $ = !!e.zuordnung[f];
      return v`<polygon class="plan-raum ${$ ? "on" : ""}" points=${p.punkte.map((z) => z.join(",")).join(" ")} />
          <circle class="plan-nr" cx=${b} cy=${g} r=${e.g.breite / 40} /><text class="plan-nr" x=${b} y=${g} dy="0.35em" font-size=${e.g.breite / 30}>${f + 1}</text>`;
    })}
      ${e.g.luecken.map((p, f) => {
      const b = e.g.raeume[p.raum].punkte, g = b[p.kante], $ = b[(p.kante + 1) % b.length], z = Math.hypot($[0] - g[0], $[1] - g[1]) || 1, M = (H) => [g[0] + ($[0] - g[0]) * H / z, g[1] + ($[1] - g[1]) * H / z], [x, _] = M(p.von_px), [A, S] = M(p.bis_px);
      return v`<line class="plan-luecke ${e.art[f]}" x1=${x} y1=${_} x2=${A} y2=${S} stroke-width=${e.g.breite / 150} />`;
    })}
      ${l}
    </svg>`, c = e.zuordnung.filter(Boolean), d = c.length !== new Set(c).size;
    return u`<div class="neu-raum">
      <h3>Grundriss übernehmen</h3>
      <p class="hint small">
        ${e.g.raeume.length ? `${e.g.raeume.length} ${e.g.raeume.length === 1 ? "Raum" : "Räume"} erkannt. Grün sind Türen, grau Fenster. Übernommen werden Wände, Türen, die Lage im Haus und das Bild als Hintergrund (es bleibt in deinem Home Assistant).` : "Keine Räume erkannt (dafür braucht es die blauen Umrisslinien eines Scans). Das Bild lässt sich trotzdem als Hintergrund übernehmen; die Wände zeichnest du dann darüber."}
      </p>
      ${h}
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
            @change=${(p) => i({ streckeM: Number(p.target.value.replace(",", ".")) || 0 })}
          /><span class="unit">m</span></label
        >
      </div>
      ${e.g.raeume.length ? u`<div class="label-text">oder über einen erkannten Raum</div>` : m}
      <div class="mass" style=${e.g.raeume.length ? "" : "display:none"}>
        <select @change=${(p) => i({ massRaum: Number(p.target.value) })}>
          ${e.g.raeume.map((p, f) => u`<option value=${f} ?selected=${e.massRaum === f}>Raum ${f + 1}</option>`)}
        </select>
        <span>ist innen</span>
        <select @change=${(p) => i({ massSeite: p.target.value })}>
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
            @change=${(p) => i({ massM: Number(p.target.value.replace(",", ".")) || 0 })}
          /><span class="unit">m</span></label
        >
      </div>
      <ul class="list">
        ${e.g.raeume.map(
      (p, f) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><b>${f + 1}</b></span>
              <span class="name">Raum ${f + 1}<small>${s(f)}</small></span>
              <select
                @change=${(b) => {
        const g = [...e.zuordnung];
        g[f] = b.target.value, i({ zuordnung: g });
      }}
              >
                <option value="" ?selected=${!e.zuordnung[f]}>nicht übernehmen</option>
                ${n.map((b) => u`<option value=${b.id} ?selected=${e.zuordnung[f] === b.id}>${b.name}</option>`)}
              </select>
            </div>
            ${e.g.luecken.map((b, g) => ({ l: b, li: g })).filter(({ l: b }) => b.raum === f).map(
        ({ l: b, li: g }) => u`<div class="row static luecke">
                  <ha-icon icon="mdi:door"></ha-icon>
                  <span class="name"
                    >${t ? `${((b.bis_px - b.von_px) * t / 100).toFixed(2).replace(".", ",")} m breit` : "Lücke"}<small
                      >${b.partner !== null ? `zu Raum ${b.partner + 1}` : "Außenwand"}</small
                    ></span
                  >
                  <select @change=${($) => i({ art: { ...e.art, [g]: $.target.value } })}>
                    <option value="tuer" ?selected=${e.art[g] === "tuer"}>Tür</option>
                    <option value="offen" ?selected=${e.art[g] === "offen"}>offen</option>
                    <option value="fenster" ?selected=${e.art[g] === "fenster"}>Fenster (weglassen)</option>
                  </select>
                </div>`
      )}
          </li>`
    )}
      </ul>
      ${n.some((p) => e.zuordnung.includes(p.id) && p.art !== "melder") ? u`<p class="note">Bei Räumen mit Radarsensor danach den Sensor einmessen (Sensor und Raum → Sensor umsetzen), damit er zu den neuen Wänden passt.</p>` : m}
      ${d ? u`<p class="note warn">Jeder Raum nur einmal zuordnen.</p>` : m}
      ${n.length ? m : u`<p class="hint small">Zuerst Räume anlegen (Raum hinzufügen), dann hier zuordnen.</p>`}
      <div class="actions">
        <button class="text small" @click=${this.planZu}>Abbrechen</button>
        <span class="spacer"></span>
        <button class="primary" ?disabled=${!t || d || this.saving} @click=${this.planUebernehmen}>
          <ha-icon icon="mdi:check"></ha-icon>${c.length ? "Übernehmen" : "Als Hintergrund übernehmen"}
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
        o({ stockwerke: c ? [...d.filter((p) => p !== l.id), l.id] : d.filter((p) => p !== l.id) });
      }}
                  /><span>${l.name}</span></label
                >`
    )}
            </div>
            <p class="hint small">Eine Treppe liegt auf zwei Stockwerken; sie erscheint dann in beiden Plänen an derselben Stelle.</p>` : m}`;
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
        const c = h.target.checked, d = c ? [...t.melder, o.id] : t.melder.filter((p) => p !== o.id);
        n({ melder: d, bereich_id: t.bereich_id || (c ? o.bereich_id ?? "" : t.bereich_id) });
      }}
          /><span
            >${o.name}<small
              >${this.bereichName(o.bereich_id)} · ${o.klasse === "motion" ? "Bewegung" : "Anwesenheit"}${o.benutzt_von ? ` · schon in „${this.data?.raeume.find((h) => h.id === o.benutzt_von)?.name ?? o.benutzt_von}“` : ""}</small
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
                          <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
                          <span class="name">${o.name}<small>${o.melder.length} ${o.melder.length === 1, "Melder"} in diesem Bereich</small></span>
                          <button class="text small" ?disabled=${this.saving} @click=${() => this.createRoom({ name: o.name, art: "melder", melder: o.melder, bereich_id: o.bereich_id })}>
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
            ${t.art === "melder" ? e.melder.length ? u`<ul class="melder-liste">
                    ${e.melder.map(a)}
                  </ul>` : u`<p class="hint small">Keine Bewegungs- oder Präsenzmelder in Home Assistant gefunden.</p>` : i.length ? u`<label class="field"
                    >Gerät<select @change=${(o) => n({ device_id: o.target.value })}>
                      <option value="" ?selected=${!t.device_id}>bitte wählen</option>
                      ${i.map((o) => u`<option value=${o.device_id} ?selected=${t.device_id === o.device_id}>${o.name}</option>`)}
                    </select></label
                  >` : u`<p class="hint small">Kein freier FP400 gefunden (alle sind schon einem Raum zugeordnet).</p>`}
            <label class="field"
              >Bereich in Home Assistant<select @change=${(o) => n({ bereich_id: o.target.value })}>
                <option value="" ?selected=${!t.bereich_id}>keiner</option>
                ${e.bereiche.map((o) => u`<option value=${o.bereich_id} ?selected=${t.bereich_id === o.bereich_id}>${o.name}</option>`)}
              </select></label
            >
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
        ${r.map(([o, l]) => v`<rect x=${((o - e.von) / a * 1e3).toFixed(1)} y="0" width=${Math.max(3, (l - o) / a * 1e3).toFixed(1)} height="10" fill="var(--rz-bereich)" />`)}
      </svg>`;
    }, i = e ? Un(e.raeume).slice(-12).reverse() : [];
    return u`<h3>Bewegungsprofil</h3>
      <div class="label-text">Wann war wo jemand? Die letzten</div>
      <div class="levels" role="group" aria-label="Zeitraum">
        <button class=${this.profilStunden === 0 ? "active" : ""} @click=${() => this.loadProfil(0)}>aus</button>
        ${xt.map((r) => u`<button class=${this.profilStunden === r ? "active" : ""} @click=${() => this.loadProfil(r)}>${r} h</button>`)}
      </div>
      ${this.profilLaedt ? u`<p class="hint">Rechnet …</p>` : e ? u`<ul class="list ausw">
                ${t.map((r) => {
      const a = e.raeume[r.id];
      return u`<li class="item" style="--zone:var(--rz-bereich)">
                    <div class="row static">
                      <span class="name">${r.name}<small>${a ? a.length ? `${a.length}-mal` : "niemand" : "keine Aufnahme"}</small></span>
                      <span class="dauer">${a?.length ? ae(Zn(a)) : ""}</span>
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
    const e = this.ausw, t = (o) => o === W && this.istMelder ? "Jemand da" : this.zones.find((l) => l.id === o)?.name ?? o, n = (o) => {
      const l = this.zones.find((h) => h.id === o);
      return l ? le(ie(l)) : o === W ? "var(--rz-bereich)" : "var(--muted)";
    }, s = u`<div class="levels" role="group" aria-label="Zeitraum">
      ${xt.map(
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
                  <span class="dauer" title=${o.sekunden > o.belegt_s + 60 ? `Alle Figuren zusammen: ${ae(o.sekunden)}` : ""}>${ae(o.belegt_s)}</span>
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
    const t = gt(bt(e.figuren.filter((i) => !i.hund).map((i) => i.zellen)), e.zelle_cm, 8);
    if (!t) return m;
    const n = Dn(t, 600).filter((i) => !this.zones.some((r) => Te(i.mitte, r.form))).slice(0, 4);
    if (!n.length) return m;
    const s = (i) => (i / 100).toFixed(1).replace(".", ",");
    return u`<h3>Vorschläge für Zonen</h3>
      <p class="hint small">Hier hielt sich jemand lange auf, aber es ist noch keine Zone. Zum Beispiel ein Liegeplatz, das Sofa oder ein Schreibtisch.</p>
      <ul class="list">
        ${n.map(
      (i, r) => u`<li class="item">
            <div class="row static">
              <span class="marker-icon"><ha-icon icon="mdi:selection-marker"></ha-icon></span>
              <span class="name">Platz ${r + 1}<small>ca. ${s(i.breite)} × ${s(i.tiefe)} m · ${ae(i.sekunden)}</small></span>
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
                  <span class="dauer">${ae(s.sekunden)}</span>
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
        ${this.istMelder ? m : u`<button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => this.openTab("zonen")}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>`}
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
k.styles = On;
w([
  Pt({ type: Boolean, reflect: !0 })
], k.prototype, "narrow", 2);
w([
  y()
], k.prototype, "data", 2);
w([
  y()
], k.prototype, "raumId", 2);
w([
  y()
], k.prototype, "zones", 2);
w([
  y()
], k.prototype, "sensor", 2);
w([
  y()
], k.prototype, "umriss", 2);
w([
  y()
], k.prototype, "oeffnungen", 2);
w([
  y()
], k.prototype, "selVertex", 2);
w([
  y()
], k.prototype, "selOpening", 2);
w([
  y()
], k.prototype, "openingDraft", 2);
w([
  y()
], k.prototype, "selected", 2);
w([
  y()
], k.prototype, "sensorOpen", 2);
w([
  y()
], k.prototype, "tab", 2);
w([
  y()
], k.prototype, "tool", 2);
w([
  y()
], k.prototype, "draft", 2);
w([
  y()
], k.prototype, "rectDraft", 2);
w([
  y()
], k.prototype, "hover", 2);
w([
  y()
], k.prototype, "view", 2);
w([
  y()
], k.prototype, "size", 2);
w([
  y()
], k.prototype, "live", 2);
w([
  y()
], k.prototype, "heat", 2);
w([
  y()
], k.prototype, "heatMin", 2);
w([
  y()
], k.prototype, "ausw", 2);
w([
  y()
], k.prototype, "auswStunden", 2);
w([
  y()
], k.prototype, "auswLaedt", 2);
w([
  y()
], k.prototype, "auswFehler", 2);
w([
  y()
], k.prototype, "kandidaten", 2);
w([
  y()
], k.prototype, "wiz", 2);
w([
  y()
], k.prototype, "plan", 2);
w([
  y()
], k.prototype, "planLaedt", 2);
w([
  y()
], k.prototype, "planBilder", 2);
w([
  y()
], k.prototype, "zeigePlan", 2);
w([
  y()
], k.prototype, "masse", 2);
w([
  y()
], k.prototype, "stockwerk", 2);
w([
  y()
], k.prototype, "hausExtra", 2);
w([
  y()
], k.prototype, "neuRaum", 2);
w([
  y()
], k.prototype, "profil", 2);
w([
  y()
], k.prototype, "profilStunden", 2);
w([
  y()
], k.prototype, "profilLaedt", 2);
w([
  y()
], k.prototype, "auswFigur", 2);
w([
  y()
], k.prototype, "layersOpen", 2);
w([
  y()
], k.prototype, "layers", 2);
w([
  y()
], k.prototype, "dirty", 2);
w([
  y()
], k.prototype, "zonesFollow", 2);
w([
  y()
], k.prototype, "saving", 2);
w([
  y()
], k.prototype, "error", 2);
w([
  y()
], k.prototype, "toast", 2);
w([
  y()
], k.prototype, "page", 2);
w([
  y()
], k.prototype, "lagen", 2);
w([
  y()
], k.prototype, "tueren", 2);
w([
  y()
], k.prototype, "hausLive", 2);
w([
  y()
], k.prototype, "hausSel", 2);
w([
  y()
], k.prototype, "aufnahme", 2);
w([
  y()
], k.prototype, "melder", 2);
w([
  y()
], k.prototype, "nachlauf", 2);
w([
  y()
], k.prototype, "aufnahmeTage", 2);
k = w([
  on("raumzonen-panel")
], k);
export {
  k as RaumzonenPanel
};
