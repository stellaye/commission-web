import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// CommissionPage — 推广中心
// Props:
//   wxUser       - { openid, nickname, ref_code, ... }
//   loginType    - 'mobile' | 'web'
//   onWxLogin    - fn  触发微信登录
//   wxLoading    - bool
// ============================================================

const API = '/wanxiang/api';
const BASE_LINK = 'https://stellarsmart.cn/wanxiang_institute/';
const PAGE_SIZE = 15;
const WITHDRAW_LIMITS = { singleMax: 200, dailyMax: 20000, min: 0.01 };
const fenToYuan = f => (f / 100).toFixed(2);
const fenToYuanShort = f => { const y = f / 100; return y % 1 === 0 ? y.toFixed(0) : parseFloat(y.toFixed(2)).toString(); };
const isWechat = /MicroMessenger/i.test(navigator.userAgent);

// ── 格式化时间 ──
const fmtTime = ts => {
    if (!ts) return '—';
    try {
        const d = new Date(ts.includes('T') ? ts : ts.replace(' ', 'T'));
        if (isNaN(d)) return ts;
        const p = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    } catch { return ts; }
};

// ── 色彩 ──
const C = {
    bg: '#0d1117', bg2: '#161b22', bg3: '#1c2128',
    border: 'rgba(240,246,252,0.06)', borderL: 'rgba(240,246,252,0.1)',
    t0: '#f0f3f6', t1: '#d1d5db', t2: '#9ca3af', t3: '#6b7280', t4: '#4b5563',
    pri: '#8b7ec8', priL: '#a99de0', priDim: 'rgba(139,126,200,0.06)', priBorder: 'rgba(139,126,200,0.14)',
    gold: '#c9a85c', goldDim: 'rgba(201,168,92,0.08)', goldBorder: 'rgba(201,168,92,0.18)',
    green: '#6bc48f', greenDim: 'rgba(107,196,143,0.08)', greenBorder: 'rgba(107,196,143,0.15)',
    red: '#e5856d', redDim: 'rgba(229,133,109,0.08)',
    orange: '#d4a053', orangeDim: 'rgba(212,160,83,0.08)', orangeBorder: 'rgba(212,160,83,0.15)',
};

// ============================================================
// Sub-components
// ============================================================

const Card = ({ children, style }) => (
    <div style={{
        background: C.bg2, borderRadius: 16, border: `1px solid ${C.border}`,
        padding: '20px 18px', marginBottom: 14, ...style,
    }}>{children}</div>
);

const StatBox = ({ label, value, icon, color = C.t0 }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
        <div style={{
            fontSize: '.72rem', color: C.t3, marginTop: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>{icon}<span>{label}</span></div>
    </div>
);

const TabBar = ({ tabs, active, onChange }) => (
    <div style={{
        display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.bg2,
        borderRadius: '14px 14px 0 0', overflow: 'hidden',
    }}>
        {tabs.map(t => (
            <button key={t.key} onClick={() => onChange(t.key)} style={{
                flex: 1, padding: '13px 0', fontSize: '.85rem', fontWeight: 500,
                color: active === t.key ? C.priL : C.t3,
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: active === t.key ? `2px solid ${C.pri}` : '2px solid transparent',
                transition: 'all .25s',
            }}>{t.icon} {t.label}</button>
        ))}
    </div>
);

const EmptyState = ({ icon, title, sub }) => (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: C.t3 }}>
        <div style={{ fontSize: '2.2rem', marginBottom: 10, opacity: 0.5 }}>{icon}</div>
        <div style={{ fontSize: '.9rem', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '.78rem', color: C.t4 }}>{sub}</div>
    </div>
);

const Spinner = ({ text = '加载中...' }) => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
            width: 28, height: 28, border: `3px solid ${C.pri}`, borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px',
        }} />
        <div style={{ fontSize: '.82rem', color: C.t3 }}>{text}</div>
    </div>
);

const Btn = ({ children, onClick, disabled, variant = 'pri', style: s }) => {
    const base = {
        padding: '12px 24px', borderRadius: 10, border: 'none', fontSize: '.9rem',
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all .25s', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', ...s,
    };
    const vars = {
        pri: { background: `linear-gradient(135deg, ${C.pri}, #6c5eb5)`, color: '#fff' },
        gold: { background: `linear-gradient(135deg, ${C.gold}, #b08d3e)`, color: '#fff' },
        ghost: { background: 'rgba(255,255,255,0.04)', color: C.t2, border: `1px solid ${C.border}` },
        green: { background: `linear-gradient(135deg, #07c160, #06ad56)`, color: '#fff' },
    };
    return <button onClick={onClick} disabled={disabled} style={{ ...base, ...vars[variant] }}>{children}</button>;
};

// ============================================================
// Main Component
// ============================================================
const CommissionPage = ({ wxUser, loginType, onWxLogin, wxLoading }) => {
    // ── State ──
    const [dash, setDash] = useState({ balance: 0, total_earnings: 0, order_count: 0, referral_count: 0 });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('links');
    const [copied, setCopied] = useState(null);

    // Orders
    const [orders, setOrders] = useState([]);
    const [ordersLoad, setOrdersLoad] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersMore, setOrdersMore] = useState(false);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Withdrawals
    const [wdList, setWdList] = useState([]);
    const [wdLoad, setWdLoad] = useState(false);
    const [wdPage, setWdPage] = useState(1);
    const [wdMore, setWdMore] = useState(false);
    const [wdTotal, setWdTotal] = useState(0);

    // Withdraw modal
    const [showWd, setShowWd] = useState(false);
    const [wdType, setWdType] = useState('all');
    const [wdAmount, setWdAmount] = useState('');
    const [wdBusy, setWdBusy] = useState(false);
    const [wdStep, setWdStep] = useState(0);
    const [wdTimes, setWdTimes] = useState(1);
    const [wdError, setWdError] = useState('');

    // Copy WeChat ID state
    const [wxCopied, setWxCopied] = useState(false);

    const openid = wxUser?.openid;
    const refCode = wxUser?.ref_code;

    // ── Fetchers ──
    const fetchDash = useCallback(async () => {
        if (!openid) return;
        try {
            const r = await (await fetch(`${API}/dashboard?openid=${encodeURIComponent(openid)}&login_type=${loginType}`)).json();
            if (r.success && r.data) setDash(r.data);
        } catch (e) { console.error(e); }
    }, [openid, loginType]);

    const fetchProducts = useCallback(async () => {
        if (!openid) return;
        try {
            const r = await (await fetch(`${API}/products?openid=${encodeURIComponent(openid)}&login_type=${loginType}`)).json();
            if (r.success) setProducts(r.products || []);
        } catch (e) { console.error(e); }
    }, [openid, loginType]);

    const fetchOrders = useCallback(async (page = 1, append = false) => {
        if (!openid) return;
        setOrdersLoad(true);
        try {
            const r = await (await fetch(`${API}/orders?openid=${encodeURIComponent(openid)}&login_type=${loginType}&page=${page}&page_size=${PAGE_SIZE}`)).json();
            if (r.success) {
                setOrders(p => append ? [...p, ...r.orders] : r.orders);
                setOrdersTotal(r.total || 0);
                setOrdersMore(r.has_more || false);
                setOrdersPage(page);
            }
        } catch (e) { console.error(e); }
        setOrdersLoad(false);
    }, [openid, loginType]);

    const fetchWd = useCallback(async (page = 1, append = false) => {
        if (!openid) return;
        setWdLoad(true);
        try {
            const r = await (await fetch(`${API}/withdrawals?openid=${encodeURIComponent(openid)}&login_type=${loginType}&page=${page}&page_size=${PAGE_SIZE}`)).json();
            if (r.success) {
                setWdList(p => append ? [...p, ...r.withdrawals] : r.withdrawals);
                setWdTotal(r.total || 0);
                setWdMore(r.has_more || false);
                setWdPage(page);
            }
        } catch (e) { console.error(e); }
        setWdLoad(false);
    }, [openid, loginType]);

    // ── Init ──
    useEffect(() => {
        if (!openid) { setLoading(false); return; }
        (async () => {
            setLoading(true);
            await Promise.all([fetchDash(), fetchProducts()]);
            setLoading(false);
        })();
    }, [openid, fetchDash, fetchProducts]);

    // 在 CommissionPage 组件里，openid 相关的 useEffect 后面加：

    useEffect(() => {
        if (!openid || !isWechat) return;
        (async () => {
            try {
                // 加载 JSSDK script
                if (!window.wx) {
                    await new Promise((resolve, reject) => {
                        if (document.querySelector('script[src*="jweixin"]')) { resolve(); return; }
                        const s = document.createElement('script');
                        s.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
                        s.onload = resolve;
                        s.onerror = reject;
                        document.head.appendChild(s);
                    });
                }
                // 获取签名并配置
                const res = await fetch('/wanxiang/api/wechat/jsapi_signature', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: window.location.href.split('#')[0] }),
                });
                const d = await res.json();
                if (d.success && window.wx) {
                    window.wx.config({
                        debug: false,
                        appId: 'wx50afdd19b43f590e',
                        timestamp: d.timestamp,
                        nonceStr: d.nonceStr,
                        signature: d.signature,
                        jsApiList: ['requestMerchantTransfer'],
                    });
                }
            } catch (e) {
                console.error('JSSDK初始化失败:', e);
            }
        })();
    }, [openid]);
    // Lazy load tabs
    const handleTab = t => {
        setTab(t);
        if (t === 'orders' && orders.length === 0) fetchOrders(1);
        if (t === 'withdrawals' && wdList.length === 0) fetchWd(1);
    };

    // ── Copy link ──
    const copyLink = (item) => {
        const link = `${BASE_LINK}${item.url_path}?ref=${refCode}`;
        const fallback = () => {
            const ta = document.createElement('textarea');
            ta.value = link; ta.style.cssText = 'position:fixed;left:-9999px';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).catch(fallback);
        } else { fallback(); }
        setCopied(item.id);
        setTimeout(() => setCopied(null), 2200);
    };

    // ── Copy WeChat ID ──
    const copyWxId = () => {
        const wxId = 'woodwithyrj';
        const fallback = () => {
            const ta = document.createElement('textarea');
            ta.value = wxId; ta.style.cssText = 'position:fixed;left:-9999px';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(wxId).catch(fallback);
        } else { fallback(); }
        setWxCopied(true);
        setTimeout(() => setWxCopied(false), 2200);
    };

    // ── Withdraw ──
    const pollDash = () => {
        fetchDash();
        [2000, 4000, 6000].forEach(d => setTimeout(fetchDash, d));
    };

    const doWithdraw = async () => {
        if (!isWechat) { setWdError('请在微信浏览器中打开本页面进行提现'); return; }
        const balYuan = dash.balance / 100;
        const target = wdType === 'all' ? balYuan : parseFloat(wdAmount);
        if (isNaN(target) || target <= 0) { setWdError('请输入有效金额'); return; }
        if (target < WITHDRAW_LIMITS.min) { setWdError(`最低提现 ¥${WITHDRAW_LIMITS.min}`); return; }
        if (target > balYuan) { setWdError('金额超过余额'); return; }

        const times = Math.ceil(target / WITHDRAW_LIMITS.singleMax);
        if (wdTimes === 1 && times > 1) setWdTimes(times);

        const step = wdTimes > 1 ? wdStep : 0;
        const isLast = step === times - 1;
        const curAmt = isLast ? target - step * WITHDRAW_LIMITS.singleMax : WITHDRAW_LIMITS.singleMax;

        const closeAll = () => { setShowWd(false); setWdAmount(''); setWdStep(0); setWdTimes(1); setWdError(''); };
        const resetStep = () => { setWdStep(0); setWdTimes(1); };

        const onSuccess = (amt) => {
            setDash(p => ({ ...p, balance: Math.max((p.balance || 0) - Math.round(amt * 100), 0) }));
            pollDash();
            if (wdList.length > 0 || tab === 'withdrawals') fetchWd(1);
        };

        setWdBusy(true); setWdError('');
        try {
            const res = await fetch(`${API}/withdraw`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: curAmt, openid, login_type: loginType, nickname: wxUser?.nickname }),
            });
            const data = await res.json();

            if (data.success && data.direct) {
                if (isLast || times === 1) {
                    onSuccess(target); closeAll(); alert('提现成功！已到账微信零钱');
                } else {
                    onSuccess(curAmt); setWdStep(p => p + 1);
                    alert(`第 ${wdStep + 1} 笔提现成功，请继续`);
                }
            } else if (data.success && data.package_info) {
                // JSSDK 收款确认
                window.wx?.checkJsApi?.({
                    jsApiList: ['requestMerchantTransfer'],
                    success: (ck) => {
                        if (ck.checkResult?.requestMerchantTransfer) {
                            window.WeixinJSBridge?.invoke('requestMerchantTransfer', {
                                mchId: data.mch_id, appId: data.app_id, package: data.package_info,
                            }, (r) => {
                                if (r.err_msg === 'requestMerchantTransfer:ok') {
                                    if (isLast || times === 1) {
                                        onSuccess(target); closeAll(); alert('收款成功！');
                                    } else {
                                        onSuccess(curAmt); setWdStep(p => p + 1);
                                        alert(`第 ${wdStep + 1} 笔收款成功，请继续`);
                                    }
                                } else if (r.err_msg === 'requestMerchantTransfer:cancel') {
                                    setWdError('已取消收款'); resetStep();
                                } else {
                                    setWdError(r.err_msg || '收款异常'); resetStep();
                                }
                                setWdBusy(false);
                            });
                        } else { setWdError('微信版本过低，请更新'); setWdBusy(false); }
                    },
                    fail: () => { setWdError('微信接口检查失败'); setWdBusy(false); },
                });
                return; // setWdBusy will be set in callback
            } else {
                setWdError(data.msg || '提现失败'); resetStep();
            }
        } catch (e) {
            setWdError('网络错误: ' + e.message); resetStep();
        }
        setWdBusy(false);
    };

    // ── 未登录 ──
    if (!openid) {
        return (
            <div style={S.page}>
                <div style={{ ...S.center, paddingTop: 100 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>💎</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: C.t0, marginBottom: 8 }}>推广中心</h2>
                        <p style={{ color: C.t3, fontSize: '.88rem', marginBottom: 30, lineHeight: 1.7 }}>
                            分享链接，好友购买即赚 <span style={{ color: C.gold, fontWeight: 700 }}>45%</span> 佣金<br />
                            请先登录以查看您的推广数据
                        </p>
                        <Btn onClick={() => onWxLogin?.()} disabled={wxLoading} variant="green"
                            style={{ maxWidth: 280, margin: '0 auto' }}>
                            {wxLoading ? '⏳ 登录中...' : '🔑 微信登录'}
                        </Btn>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div style={S.page}><div style={S.center}><Spinner text="加载推广数据..." /></div></div>;
    }

    const balYuan = fenToYuan(dash.balance);

    // ============================================================
    // Render
    // ============================================================
    return (
        <div style={S.page}>
            <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .comm-hover:hover{background:rgba(255,255,255,0.04)!important}
      `}</style>

            <div style={S.center}>

                {/* ── Header ── */}
                <div style={{ textAlign: 'center', padding: '36px 16px 20px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 14px', borderRadius: 16,
                        background: C.goldDim, border: `1px solid ${C.goldBorder}`, marginBottom: 14,
                    }}>
                        <span style={{ fontSize: '.8rem', color: C.gold, fontWeight: 600, letterSpacing: 2 }}>💎 推广中心</span>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.t0, letterSpacing: 2, margin: '0 0 6px' }}>
                        推广赚佣金
                    </h1>
                    <p style={{ fontSize: '.82rem', color: C.t3 }}>
                        {wxUser?.nickname || '用户'} · 推荐码 <span style={{ color: C.priL, fontWeight: 600 }}>{refCode || '—'}</span>
                    </p>
                </div>

                {/* ── Balance Card ── */}
                <Card style={{ background: `linear-gradient(135deg, ${C.bg2}, rgba(139,126,200,0.06))`, border: `1px solid ${C.priBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '.82rem', color: C.t3 }}>可提现佣金 (元)</span>
                        <button onClick={fetchDash} style={{
                            background: C.priDim, border: `1px solid ${C.priBorder}`, borderRadius: 14,
                            padding: '4px 12px', fontSize: '.72rem', color: C.priL, cursor: 'pointer',
                        }}>刷新</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                        <span style={{ fontSize: '2.6rem', fontWeight: 800, color: C.gold, letterSpacing: 1 }}>¥{balYuan}</span>
                        <Btn onClick={() => { setShowWd(true); setWdError(''); }} disabled={dash.balance <= 0}
                            variant="gold" style={{ width: 'auto', padding: '10px 24px', fontSize: '.88rem' }}>
                            💰 提现
                        </Btn>
                    </div>
                    <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                        <StatBox label="累计收益" value={`¥${fenToYuanShort(dash.total_earnings)}`} icon="📈" color={C.gold} />
                        <div style={{ width: 1, background: C.border }} />
                        <StatBox label="成交订单" value={dash.order_count} icon="🎁" />
                        <div style={{ width: 1, background: C.border }} />
                        <StatBox label="推广人数" value={dash.referral_count} icon="👥" />
                    </div>
                </Card>

                {/* ── Customer Service Card ── */}
                <Card style={{
                    background: C.bg2,
                    border: `1px solid ${C.greenBorder}`,
                    padding: '16px 18px',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                background: C.greenDim, border: `1px solid ${C.greenBorder}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem',
                            }}>💬</div>
                            <div>
                                <div style={{ fontSize: '.88rem', fontWeight: 600, color: C.t0 }}>客服微信</div>
                                <div style={{
                                    fontSize: '.82rem', color: C.priL, fontWeight: 600, marginTop: 3,
                                    fontFamily: 'monospace', letterSpacing: 0.5,
                                }}>woodwithyrj</div>
                            </div>
                        </div>
                        <button onClick={copyWxId} style={{
                            padding: '8px 18px', borderRadius: 20, border: 'none', fontSize: '.82rem',
                            fontWeight: 600, cursor: 'pointer', transition: 'all .25s', flexShrink: 0,
                            background: wxCopied ? 'linear-gradient(135deg,#07c160,#06ad56)' : C.greenDim,
                            color: wxCopied ? '#fff' : C.green,
                            border: `1px solid ${wxCopied ? 'transparent' : C.greenBorder}`,
                        }}>
                            {wxCopied ? '✅ 已复制' : '📋 复制微信号'}
                        </button>
                    </div>
                    <div style={{
                        fontSize: '.72rem', color: C.t4, marginTop: 10, paddingLeft: 52,
                        lineHeight: 1.6,
                    }}>
                        推广问题、提现问题均可联系客服咨询
                    </div>
                </Card>

                {/* ── Tabs ── */}
                <div style={{ background: C.bg2, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 14 }}>
                    <TabBar
                        tabs={[
                            { key: 'links', label: '推广链接', icon: '🔗' },
                            { key: 'orders', label: '成交订单', icon: '📋' },
                            { key: 'withdrawals', label: '提现记录', icon: '💳' },
                        ]}
                        active={tab} onChange={handleTab}
                    />

                    {/* ── Links Tab ── */}
                    {tab === 'links' && (
                        <div style={{ padding: 14 }}>
                            <div style={{ fontSize: '.76rem', color: C.t4, marginBottom: 12, padding: '0 4px' }}>
                                点击复制您的专属推广链接，好友通过链接购买即获得佣金
                            </div>
                            {products.length === 0 ? (
                                <EmptyState icon="📦" title="暂无可推广产品" sub="" />
                            ) : products.map(item => (
                                <div key={item.id} style={{
                                    background: C.bg3, borderRadius: 12, padding: '14px 16px', marginBottom: 8,
                                    border: `1px solid ${C.border}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.icon || '📦'}</span>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '.9rem', fontWeight: 600, color: C.t0 }}>{item.name}</div>
                                                <div style={{ fontSize: '.75rem', color: C.t4, marginTop: 2 }}>{item.desc}</div>
                                                <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        fontSize: '.7rem', padding: '2px 8px', borderRadius: 8,
                                                        background: C.priDim, color: C.priL, border: `1px solid ${C.priBorder}`,
                                                    }}>售价 ¥{fenToYuanShort(item.active_price)}</span>
                                                    <span style={{
                                                        fontSize: '.7rem', padding: '2px 8px', borderRadius: 8,
                                                        background: C.goldDim, color: C.gold, border: `1px solid ${C.goldBorder}`,
                                                    }}>佣金 ¥{fenToYuanShort(item.commission)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => copyLink(item)} style={{
                                            padding: '8px 18px', borderRadius: 20, border: 'none', fontSize: '.82rem',
                                            fontWeight: 600, cursor: 'pointer', transition: 'all .25s', flexShrink: 0, marginLeft: 10,
                                            background: copied === item.id ? 'linear-gradient(135deg,#07c160,#06ad56)' : C.priDim,
                                            color: copied === item.id ? '#fff' : C.priL,
                                            border: `1px solid ${copied === item.id ? 'transparent' : C.priBorder}`,
                                        }}>
                                            {copied === item.id ? '✅ 已复制' : '📋 复制链接'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Orders Tab ── */}
                    {tab === 'orders' && (
                        <div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 16px', background: 'rgba(255,255,255,0.01)',
                            }}>
                                <span style={{ fontSize: '.76rem', color: C.t4 }}>共 {ordersTotal} 笔成交</span>
                                <button onClick={() => fetchOrders(1)} disabled={ordersLoad} style={{
                                    background: C.priDim, border: `1px solid ${C.priBorder}`, borderRadius: 14,
                                    padding: '3px 10px', fontSize: '.7rem', color: C.priL, cursor: 'pointer',
                                }}>🔄 刷新</button>
                            </div>
                            {ordersLoad && orders.length === 0 ? <Spinner text="加载订单..." /> :
                                orders.length === 0 ? <EmptyState icon="📋" title="暂无成交订单" sub="分享推广链接，好友付款后即可获得佣金" /> : (
                                    <div style={{ padding: '8px 14px 14px' }}>
                                        {orders.map(o => (
                                            <div key={o.id} style={{
                                                background: C.bg3, borderRadius: 12, marginBottom: 6,
                                                border: `1px solid ${C.border}`, overflow: 'hidden',
                                            }}>
                                                <div onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '12px 14px', cursor: 'pointer',
                                                    }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                            background: C.greenDim, border: `1px solid ${C.greenBorder}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                                                        }}>{o.product_icon || '📦'}</div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: '.85rem', fontWeight: 600, color: C.t0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product_name}</div>
                                                            <div style={{ fontSize: '.72rem', color: C.t4, marginTop: 2 }}>{fmtTime(o.paid_at)}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                                                        <div style={{ fontSize: '.88rem', fontWeight: 700, color: C.green }}>+¥{fenToYuan(o.commission)}</div>
                                                        <div style={{ fontSize: '.72rem', color: C.t4 }}>付款 ¥{fenToYuan(o.paid_amount)}</div>
                                                    </div>
                                                    <span style={{
                                                        marginLeft: 6, fontSize: '.6rem', color: C.t4, transition: 'transform .25s',
                                                        transform: expandedOrder === o.id ? 'rotate(180deg)' : 'none',
                                                    }}>▾</span>
                                                </div>
                                                {expandedOrder === o.id && (
                                                    <div style={{ padding: '0 14px 14px' }}>
                                                        <div style={{
                                                            background: C.bg2, borderRadius: 10, padding: 12, fontSize: '.78rem',
                                                            display: 'grid', gap: 6,
                                                        }}>
                                                            {[
                                                                ['订单编号', <span style={{ fontFamily: 'monospace', fontSize: '.72rem' }}>{o.order_no}</span>],
                                                                ['产品名称', o.product_name],
                                                                ['付款金额', <span style={{ fontWeight: 600 }}>¥{fenToYuan(o.paid_amount)}</span>],
                                                                ['佣金比例', `${o.commission_rate}%`],
                                                                ['佣金收入', <span style={{ color: C.green, fontWeight: 700 }}>¥{fenToYuan(o.commission)}</span>],
                                                                ['付款时间', fmtTime(o.paid_at)],
                                                                ...(o.buyer_nickname ? [['购买用户', o.buyer_nickname]] : []),
                                                            ].map(([k, v], i) => (
                                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span style={{ color: C.t4 }}>{k}</span>
                                                                    <span style={{ color: C.t1 }}>{v}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {ordersMore && (
                                            <div style={{ textAlign: 'center', paddingTop: 8 }}>
                                                <button onClick={() => fetchOrders(ordersPage + 1, true)} disabled={ordersLoad} style={{
                                                    background: 'none', border: 'none', color: C.priL, fontSize: '.84rem',
                                                    fontWeight: 500, cursor: 'pointer', opacity: ordersLoad ? 0.5 : 1,
                                                }}>{ordersLoad ? '加载中...' : '加载更多'}</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    )}

                    {/* ── Withdrawals Tab ── */}
                    {tab === 'withdrawals' && (
                        <div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 16px', background: 'rgba(255,255,255,0.01)',
                            }}>
                                <span style={{ fontSize: '.76rem', color: C.t4 }}>共 {wdTotal} 笔成功提现</span>
                                <button onClick={() => fetchWd(1)} disabled={wdLoad} style={{
                                    background: C.priDim, border: `1px solid ${C.priBorder}`, borderRadius: 14,
                                    padding: '3px 10px', fontSize: '.7rem', color: C.priL, cursor: 'pointer',
                                }}>🔄 刷新</button>
                            </div>
                            {wdLoad && wdList.length === 0 ? <Spinner text="加载提现记录..." /> :
                                wdList.length === 0 ? <EmptyState icon="💳" title="暂无提现记录" sub="佣金到账后即可提现到微信零钱" /> : (
                                    <div style={{ padding: '8px 14px 14px' }}>
                                        {wdList.map(w => (
                                            <div key={w.id} style={{
                                                background: C.bg3, borderRadius: 12, padding: '12px 14px', marginBottom: 6,
                                                border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                        background: C.orangeDim, border: `1px solid ${C.orangeBorder}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                                                    }}>💰</div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: '.85rem', fontWeight: 600, color: C.t0 }}>提现到微信零钱</div>
                                                        <div style={{ fontSize: '.72rem', color: C.t4, marginTop: 2 }}>{fmtTime(w.created_at)}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                                                    <div style={{ fontSize: '.88rem', fontWeight: 700, color: C.orange }}>¥{fenToYuan(w.amount)}</div>
                                                    <span style={{
                                                        fontSize: '.68rem', padding: '1px 7px', borderRadius: 8,
                                                        background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}`,
                                                    }}>已到账</span>
                                                </div>
                                            </div>
                                        ))}
                                        {wdMore && (
                                            <div style={{ textAlign: 'center', paddingTop: 8 }}>
                                                <button onClick={() => fetchWd(wdPage + 1, true)} disabled={wdLoad} style={{
                                                    background: 'none', border: 'none', color: C.priL, fontSize: '.84rem',
                                                    fontWeight: 500, cursor: 'pointer', opacity: wdLoad ? 0.5 : 1,
                                                }}>{wdLoad ? '加载中...' : '加载更多'}</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{ textAlign: 'center', padding: '20px 16px', fontSize: '.72rem', color: C.t4, lineHeight: 1.8 }}>
                    <p style={{ margin: 0 }}>佣金实时到账 · 微信零钱直接提现</p>
                    <p style={{ marginTop: 4, color: 'rgba(255,255,255,0.1)' }}>万象研究院 · 推广中心</p>
                </div>
            </div>

            {/* ================================================================ */}
            {/* ── Withdraw Modal ── */}
            {/* ================================================================ */}
            {showWd && (
                <div style={S.overlay} onClick={() => !wdBusy && setShowWd(false)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.t0, margin: 0 }}>申请提现</h3>
                            <button onClick={() => !wdBusy && setShowWd(false)} style={{
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: C.t3,
                                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem',
                            }}>✕</button>
                        </div>

                        {/* Balance display */}
                        <div style={{
                            background: C.bg3, borderRadius: 12, padding: '14px 16px', marginBottom: 16,
                            border: `1px solid ${C.border}`,
                        }}>
                            <div style={{ fontSize: '.82rem', color: C.t3, marginBottom: 4 }}>可提现余额</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: C.gold }}>¥{balYuan}</div>
                        </div>

                        {/* Limits hint */}
                        <div style={{
                            background: C.orangeDim, borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                            border: `1px solid ${C.orangeBorder}`, fontSize: '.78rem', color: C.orange, lineHeight: 1.6,
                        }}>
                            💡 单笔最高 ¥{WITHDRAW_LIMITS.singleMax}，单日最高 ¥{WITHDRAW_LIMITS.dailyMax}
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {[
                                { key: 'all', label: `全部提现 (¥${balYuan})`, sub: parseFloat(balYuan) > WITHDRAW_LIMITS.singleMax ? `需分 ${Math.ceil(parseFloat(balYuan) / WITHDRAW_LIMITS.singleMax)} 次` : null },
                                { key: 'custom', label: '自定义金额' },
                            ].map(opt => (
                                <div key={opt.key} onClick={() => { setWdType(opt.key); setWdStep(0); setWdTimes(1); setWdError(''); }}
                                    style={{
                                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                                        border: `2px solid ${wdType === opt.key ? C.pri : C.border}`,
                                        background: wdType === opt.key ? C.priDim : 'transparent',
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            border: `2px solid ${wdType === opt.key ? C.pri : C.t4}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {wdType === opt.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.pri }} />}
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '.88rem', fontWeight: 500, color: C.t0 }}>{opt.label}</span>
                                            {opt.sub && <div style={{ fontSize: '.72rem', color: C.orange, marginTop: 2 }}>{opt.sub}</div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Custom amount input */}
                        {wdType === 'custom' && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: C.t3, fontSize: '1.1rem',
                                    }}>¥</span>
                                    <input
                                        type="number" value={wdAmount}
                                        onChange={e => { setWdAmount(e.target.value); setWdStep(0); setWdTimes(1); setWdError(''); }}
                                        placeholder={`${WITHDRAW_LIMITS.min} ~ ${balYuan}`}
                                        style={{
                                            width: '100%', padding: '14px 14px 14px 36px', borderRadius: 10,
                                            border: `1px solid ${C.borderL}`, background: C.bg3, color: C.t0,
                                            fontSize: '1.05rem', outline: 'none', boxSizing: 'border-box',
                                        }}
                                        step="0.01"
                                    />
                                </div>
                                {wdAmount && parseFloat(wdAmount) > WITHDRAW_LIMITS.singleMax && (
                                    <div style={{ fontSize: '.72rem', color: C.orange, marginTop: 6, paddingLeft: 4 }}>
                                        需分 {Math.ceil(parseFloat(wdAmount) / WITHDRAW_LIMITS.singleMax)} 次提现
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Progress (multi-step) */}
                        {wdStep > 0 && wdTimes > 1 && (
                            <div style={{
                                background: C.priDim, borderRadius: 10, padding: '12px 14px', marginBottom: 16,
                                border: `1px solid ${C.priBorder}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: '.82rem', fontWeight: 500, color: C.t0 }}>提现进度</span>
                                    <span style={{ fontSize: '.82rem', color: C.priL }}>{wdStep}/{wdTimes}</span>
                                </div>
                                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ width: `${(wdStep / wdTimes) * 100}%`, height: '100%', borderRadius: 2, background: C.pri, transition: 'width .3s' }} />
                                </div>
                                <div style={{ fontSize: '.72rem', color: C.t3, marginTop: 6 }}>
                                    已完成 {wdStep} 笔，还需 {wdTimes - wdStep} 笔
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {wdError && (
                            <div style={{
                                background: C.redDim, borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                                fontSize: '.82rem', color: C.red, textAlign: 'center',
                            }}>{wdError}</div>
                        )}

                        {/* Submit */}
                        <Btn onClick={doWithdraw} disabled={wdBusy || (wdType === 'custom' && !wdAmount)} variant="gold">
                            {wdBusy ? '⏳ 处理中...' :
                                wdStep > 0 ? `继续提现 (第 ${wdStep + 1}/${wdTimes} 笔)` :
                                    wdTimes > 1 && wdStep === 0 ? `开始分批提现 (共 ${wdTimes} 笔)` :
                                        '确认提现'}
                        </Btn>
                        <div style={{ textAlign: 'center', fontSize: '.72rem', color: C.t4, marginTop: 12 }}>
                            {wdTimes > 1 ? '微信单笔限额，需分批确认' : '即时到账微信零钱'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Layout styles ──
const S = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2128 100%)',
        color: '#f0f3f6',
        fontFamily: '-apple-system,"SF Pro Display","Noto Sans SC","PingFang SC",sans-serif',
        WebkitFontSmoothing: 'antialiased',
        padding: '0 0 20px',
    },
    center: { maxWidth: 600, margin: '0 auto', padding: '0 14px' },
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20,
    },
    modal: {
        background: C.bg2, borderRadius: 20, padding: '24px 20px',
        maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto',
        border: `1px solid ${C.borderL}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
};

export default CommissionPage;