import { useState, useEffect, useRef } from 'react';
import { Copy, Check, LogOut, Wallet, QrCode, Smartphone, X, TrendingUp, Users, Gift, Edit3, ChevronDown, ChevronUp, FileText, ArrowDownCircle, RefreshCw, Shuffle, Download, ZoomIn, ChevronLeft, ChevronRight, Megaphone, Image } from 'lucide-react';

const baseLink = "https://stellarsmart.cn/wanxiang_institute/";

const WITHDRAW_LIMITS = { singleMax: 200, dailyMax: 20000, minAmount: 0.01 };

const WX_CONFIG = {
  appId: 'wxd642d4eeae08b232',
  redirectUri: "https://stellarsmart.cn/commission_web/",
  scope: 'snsapi_login',
  state: 'wx_login_state_' + Math.random().toString(36).substr(2, 10)
};

// ====== 推广文案 ======
const promotionTexts = [
  {
    id: 1, text: `【铁口直断·2026丙午年预警】

别被\u201C丙午\u201D的红火迷惑，不是所有人都适合红红火火！

老师看了几十个八字后发现，2026年丙午火旺，对一部分人是烈火烹油，对另一部分人却是火旺焚木\u2014\u2014贵人、婚姻、文书通通要小心！

如果你八字身弱，官杀混杂，今年反而要低调行事，尤其注意农历三、九、十、十一月。

\u2705 你的八字今年什么运势？
\u2705 你的幸运色、幸运方向是什么？
\u2705 哪个月能冲锋？哪个月必须躺平？

\uD83D\uDC49 专属通道，一查便知：{link}` },
  {
    id: 2, text: `【深度解析·2026年运已更新】

2026丙午年，岁运并临，磁场波动极大。

有人今年乘风破浪，有人今年谨言慎行\u2014\u2014区别在哪里？在你的八字里！

这份年运报告，不是泛泛的星座运势，而是基于你生辰八字的深度推算：
\u2714\uFE0F 你的用神是什么？忌神是什么？
\u2714\uFE0F 今年事业/财运/感情/健康四大板块详细打分
\u2714\uFE0F 12个月逐月预警，精确到农历

\uD83D\uDC49 知己知彼，点击查看你的2026运势说明书：{link}` },
  {
    id: 3, text: `【给总感觉\u201C压力山大\u201D的人】

是不是总觉得被无形的压力、规则和小人束缚？
是不是明明很努力，却总感觉使不上劲？

从命理角度看，这叫\u201C官杀攻身\u201D。但2026年，是很多人翻身的一年！

流年一到，身边会出现能帮你分担压力的朋友、同事，你的内心根基也会变强。今年的主题只有一个：借力打力，合众破局。

\uD83D\uDC49 看看你是不是那个要翻身的人：{link}` },
  {
    id: 4, text: `【给想在2026年搞钱的人】

为什么有的人赚钱轻松，有的人却赚得辛苦还留不住？
八字里说，这叫\u201C身弱不担财\u201D。

但2026年不一样！老师推算发现，今年很多人的财运格局会发生变化，正财看涨，偏财活跃，尤其农历正月、七月。

\u26A0\uFE0F 风险提示：今年合作求财的多，但务必\u201C先小人后君子\u201D，谨防因朋友破财。

\uD83D\uDC49 你的2026财运走势，点开即看：{link}` },
  {
    id: 5, text: `【给感情路上不太顺的人】

为什么你的感情总是不太平淡？
八字里叫\u201C官杀混杂\u201D。

2026年，很多人的桃花运势会非常活跃，但过程充满考验与竞争。
单身者有脱单机会（尤其农历四、五、七月），有伴侣者需警惕口舌之争。

\uD83D\uDC94 感情雷区：农历六月、十月，容易出口伤人，务必注意沟通方式。

\uD83D\uDC49 你的2026感情走势图已生成：{link}` },
  {
    id: 6, text: `【2026年，你的幸运色是什么？】

八字命理告诉你答案：

\u2705 幸运色：绿色、青色、红色、紫色
\u2705 幸运数字：3、4、2、7
\u2705 幸运方向：东方、南方
\u2705 贵人属相：虎、狗、羊

穿对颜色，去对方向，好运自然来敲门。

\uD83D\uDC49 你的专属年运报告，一键领取：{link}` },
  {
    id: 7, text: `【今年能不能发财，点开就知道】

一份价值感拉满的2026年运报告，包含：
\uD83D\uDD25 八字原局深度解析（你是身强还是身弱）
\uD83D\uDD25 2026年事业/财运/感情/健康详细打分
\uD83D\uDD25 12个月逐月吉凶预警（精确到农历）
\uD83D\uDD25 你的专属改运锦囊（贵人、小人、禁忌）

\uD83D\uDC49 不信玄学的别进，信的人点这里：{link}` },
  {
    id: 8, text: `【不到一分钟，读懂你的2026】

输入生辰，一键生成。

你的2026关键词是什么？
你的2026幸运物是什么？
你的2026贵人是谁？小人是谁？

想知道答案？年运报告里写得很清楚。

\uD83D\uDC49 {link}` },
  {
    id: 9, text: `【测完回来告诉我准不准】

朋友发给我的2026年运报告，说准得头皮发麻。

我本来不信，结果测出来说我\u201C农历三月、九月、十月要特别注意肠胃和口舌\u201D\u2014\u2014这不就是我的老毛病吗？！

给你们搞了个专属入口，测完记得回来告诉我：
准不准？你的关键月份是几月？

\uD83D\uDC49 入口在此，别声张：{link}` },
  {
    id: 10, text: `【关系铁不铁，就看你敢不敢让我看你的年运】

别问，问就是我2026年要起飞了。

报告说我今年\u201C由弱转强，合众破局\u201D，事业财运双丰收，唯独感情上有点小摩擦（建议我多穿绿色）。

想不想看看你们的2026年剧本？
我这儿有个专属通道，点开即看，童叟无欺。

\uD83D\uDC49 {link}` },
  {
    id: 11, text: `【2026丙午年·你的翻身机会到了】

过去几年是不是总觉得处处受制，有力使不出？

2026年丙午，对你可能是关键转折点！流年火旺，补足你命局所需，由弱转强，终于能挺直腰杆做人了。

但切记：火旺也伤贵人，今年对长辈、上级要多一分耐心。

\uD83D\uDC49 点击查看你的2026全方位解析：{link}` },
  {
    id: 12, text: `【别瞎忙了，先看看你的2026运势地图】

为什么有些人忙一年没结果？
因为没在对的时间做对的事！

这份报告告诉你：
\uD83D\uDCC5 哪几个月适合冲锋陷阵
\uD83D\uDCC5 哪几个月适合韬光养晦
\uD83D\uDCC5 哪几个月必须谨言慎行

\uD83D\uDC49 一键获取你的2026行动指南：{link}` },
  {
    id: 13, text: `【2026年，谁是你的贵人？谁是你的小人？】

有的人出现在你生命里是来帮你的，有的人是来给你上课的。

2026年，你的贵人藏在哪个方位？
今年要远离哪种人？

报告里写得很清楚，别等吃亏了才回头看。

\uD83D\uDC49 点击查看：{link}` },
  {
    id: 14, text: `【2026年健康预警】

很多人只关心财运事业，却忽略了身体才是本钱。

2026丙午年，火旺之年，心血管、眼睛、失眠问题是高发区！尤其农历三月、五月、六月、十月，身体最容易出状况。

提前知道，提前预防。

\uD83D\uDC49 你的2026健康走势图：{link}` },
  {
    id: 15, text: `【单身人士注意：2026桃花运来了】

2026年桃花方位：正南
桃花旺盛月份：农历四月、五月、七月

但注意：今年桃花带竞争，遇到的人可能不止一个人追。擦亮眼睛，别急着上头！

\uD83D\uDC49 看看你的正缘什么时候出现：{link}` },
  {
    id: 16, text: `【2026年，这四个月份你必须小心】

老师反复提醒：
\u26A0\uFE0F 农历三月：压力骤增，谨防口舌
\u26A0\uFE0F 农历九月：过度享受，懒散破财
\u26A0\uFE0F 农历十月：伤官见官，是非不断
\u26A0\uFE0F 农历十一月：内外交困，忍耐为上

这几个月份，能躺平就别乱动！

\uD83D\uDC49 你的完整年运报告里有详细解读：{link}` },
  {
    id: 17, text: `【2026年，你的幸运数字是多少？】

有人问：数字真的能改运吗？
命理上说，用对数字可以补足你命局所缺。

2026年你的幸运数字是：3、4、2、7
选手机号、车牌号、密码，多用这几个数。

\uD83D\uDC49 还有更多改运妙招，点开即看：{link}` },
  {
    id: 18, text: `【2026年，去这个方向能发财】

2026年你的求财吉利方位：东方、南方

找工作、出差、旅行、甚至办公桌朝向，多往这两个方向靠，财运自然来。

想知道为什么？命理老师给你讲明白。

\uD83D\uDC49 点击查看完整解读：{link}` },
  {
    id: 19, text: `【2026年，这三类人是你的贵人】

① 属虎的人
② 属狗的人
③ 属羊的人

今年多和他们来往，多听他们的建议，关键时刻能拉你一把。

\uD83D\uDC49 你的专属年运报告里还有更多干货：{link}` },
  {
    id: 20, text: `【2026年运报告·最后30个免费名额】

本来是想自己留着看的，老师催我多分享给别人。

基于真八字，不是套模板的那种泛泛之谈。
输入生日，一键生成你的2026全方位解析。

名额有限，先到先得。

\uD83D\uDC49 点击领取：{link}` }
];

// ====== 报告预览截图配置 ======
const PREVIEW_IMAGES = [
  { id: 1, url: './preview1.jpg', title: '报告预览 1' },
];

const isRealMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const fenToYuan = (fen) => (fen / 100).toFixed(2);

function App() {
  const [user, setUser] = useState(null);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [failMsg, setFailMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState('all');
  const [withdrawTimes, setWithdrawTimes] = useState(1);
  const [currentWithdrawStep, setCurrentWithdrawStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('mobile');
  const [wxLoginReady, setWxLoginReady] = useState(false);
  const [isOnMobileDevice, setIsOnMobileDevice] = useState(true);
  const [loginType, setLoginType] = useState(null);
  const [showWxGuide, setShowWxGuide] = useState(false);

  const [dashboard, setDashboard] = useState({ balance: 0, total_earnings: 0, order_count: 0, referral_count: 0 });
  const [products, setProducts] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [withdrawalsHasMore, setWithdrawalsHasMore] = useState(false);
  const [withdrawalsTotal, setWithdrawalsTotal] = useState(0);

  // ====== 每个产品独立的推广素材状态 ======
  const [expandedPromo, setExpandedPromo] = useState(null); // 当前展开素材的产品ID
  const [promoIndexMap, setPromoIndexMap] = useState({}); // { productId: currentIndex }
  const [previewImg, setPreviewImg] = useState(null);
  const [savingImg, setSavingImg] = useState(null);

  const PAGE_SIZE = 15;
  const wxLoginContainerRef = useRef(null);
  const wxScriptRef = useRef(null);
  const isWxLoginInitialized = useRef(false);

  const isWeChatBrowser = () => /MicroMessenger/i.test(navigator.userAgent);

  // ====== 获取某个产品的推广链接 ======
  const getProductPromoLink = (product) => {
    if (!user?.refcode || !product) return baseLink;
    return `${baseLink}${product.url_path}?ref=${user.refcode}`;
  };

  // ====== 获取某个产品当前的推广文案 ======
  const getPromoTextForProduct = (product) => {
    const idx = promoIndexMap[product.id] ?? Math.floor(Math.random() * promotionTexts.length);
    // 初始化（懒加载）
    if (promoIndexMap[product.id] === undefined) {
      setPromoIndexMap(prev => ({ ...prev, [product.id]: idx }));
    }
    const t = promotionTexts[idx];
    return t.text.replace(/\{link\}/g, getProductPromoLink(product));
  };

  const getPromoIndex = (productId) => {
    return promoIndexMap[productId] ?? 0;
  };

  const shufflePromoForProduct = (productId) => {
    const current = promoIndexMap[productId] ?? 0;
    let next;
    do { next = Math.floor(Math.random() * promotionTexts.length); } while (next === current && promotionTexts.length > 1);
    setPromoIndexMap(prev => ({ ...prev, [productId]: next }));
  };

  const setPromoIndexForProduct = (productId, idx) => {
    setPromoIndexMap(prev => ({ ...prev, [productId]: idx }));
  };

  const copyPromoTextForProduct = (product) => {
    const text = getPromoTextForProduct(product);
    const copyId = `promo_${product.id}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(copyId); setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const inp = document.createElement('textarea'); inp.value = text;
      document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
      setCopiedId(copyId); setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const saveImage = async (img) => {
    setSavingImg(img.id);
    try {
      const res = await fetch(img.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `report_preview_${img.id}.jpg`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.url, '_blank');
    }
    setTimeout(() => setSavingImg(null), 1500);
  };

  // ====== 原有功能 ======
  const pollDashboard = (openid, lt, retries = 3, delay = 2000) => {
    for (let i = 1; i <= retries; i++) setTimeout(() => fetchDashboard(openid, lt), delay * i);
  };

  const fetchDashboard = async (openid, lt) => {
    try {
      const res = await fetch(`/wanxiang/api/dashboard?openid=${encodeURIComponent(openid)}&login_type=${lt}`);
      const d = await res.json();
      if (d.success && d.data) setDashboard(d.data);
    } catch (e) { console.error('获取仪表盘数据失败:', e); }
  };

  const fetchProducts = async (openid, lt) => {
    try {
      const res = await fetch(`/wanxiang/api/products?openid=${encodeURIComponent(openid)}&login_type=${lt}`);
      const d = await res.json();
      if (d.success && d.products) {
        setProducts(d.products);
      }
    } catch (e) { console.error('获取产品列表失败:', e); }
  };

  const fetchOrders = async (openid, lt, page = 1, append = false) => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`/wanxiang/api/orders?openid=${encodeURIComponent(openid)}&login_type=${lt}&page=${page}&page_size=${PAGE_SIZE}`);
      const d = await res.json();
      if (d.success) {
        setOrders(prev => append ? [...prev, ...d.orders] : d.orders);
        setOrdersTotal(d.total || 0); setOrdersHasMore(d.has_more || false); setOrdersPage(page);
      }
    } catch (e) { console.error('获取订单失败:', e); }
    finally { setOrdersLoading(false); }
  };

  const fetchWithdrawals = async (openid, lt, page = 1, append = false) => {
    setWithdrawalsLoading(true);
    try {
      const res = await fetch(`/wanxiang/api/withdrawals?openid=${encodeURIComponent(openid)}&login_type=${lt}&page=${page}&page_size=${PAGE_SIZE}`);
      const d = await res.json();
      if (d.success) {
        setWithdrawals(prev => append ? [...prev, ...d.withdrawals] : d.withdrawals);
        setWithdrawalsTotal(d.total || 0); setWithdrawalsHasMore(d.has_more || false); setWithdrawalsPage(page);
      }
    } catch (e) { console.error('获取提现记录失败:', e); }
    finally { setWithdrawalsLoading(false); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders' && orders.length === 0 && user) fetchOrders(user.openid, loginType, 1);
    if (tab === 'withdrawals' && withdrawals.length === 0 && user) fetchWithdrawals(user.openid, loginType, 1);
  };

  const handleSetPrice = async (productId) => {
    const priceYuan = parseFloat(priceInput);
    if (isNaN(priceYuan) || priceYuan <= 0) { alert('请输入有效价格'); return; }
    const priceFen = Math.round(priceYuan * 100);
    setPriceLoading(true);
    try {
      const res = await fetch('/wanxiang/api/user/set_price', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openid: user.openid, login_type: loginType, product_id: productId, price: priceFen }),
      });
      const d = await res.json();
      if (d.success) {
        setProducts(prev => prev.map(p =>
          p.id === productId ? { ...p, custom_price: d.active_price, active_price: d.active_price, commission: d.commission } : p
        ));
        setEditingPrice(null); setPriceInput('');
      } else { alert(d.msg || '设置失败'); }
    } catch (e) { console.error('设置价格失败:', e); alert('网络错误，请重试'); }
    finally { setPriceLoading(false); }
  };

  const loadUserData = async (openid, lt) => {
    setDataLoading(true);
    await Promise.all([fetchDashboard(openid, lt), fetchProducts(openid, lt)]);
    setDataLoading(false);
  };

  const handleLogin = () => {
    setLoading(true);
    try {
      if (isWeChatBrowser()) {
        const mobileState = 'wx_login_state_mobile_' + Math.random().toString(36).substr(2, 10);
        const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx50afdd19b43f590e&redirect_uri=${encodeURIComponent(WX_CONFIG.redirectUri)}&response_type=code&scope=snsapi_userinfo&state=${mobileState}#wechat_redirect`;
        window.location.href = authUrl;
      } else { setLoading(false); setShowWxGuide(true); }
    } catch (e) { console.error('微信登录跳转失败:', e); setLoading(false); alert('登录失败，请重试'); }
  };

  useEffect(() => {
    const mobile = isRealMobileDevice();
    setIsOnMobileDevice(mobile); setLoginMode(mobile ? 'mobile' : 'qrcode');
  }, []);

  const getUrlParam = (name) => {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = window.location.search.substr(1).match(reg);
    return r ? decodeURIComponent(r[2]) : null;
  };

  useEffect(() => {
    const code = getUrlParam('code');
    const state = getUrlParam('state');
    if (code && state && state.includes('wx_login_state_')) handleWxCodeToUserInfo(code, state.includes('mobile'));
  }, []);

  const initWxJSSDK = async () => {
    try {
      const res = await fetch('/wanxiang/api/wechat/jsapi_signature', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.href.split('#')[0] })
      });
      const d = await res.json();
      if (!d.success) return;
      window.wx.config({ debug: false, appId: 'wx50afdd19b43f590e', timestamp: d.timestamp, nonceStr: d.nonceStr, signature: d.signature, jsApiList: ['requestMerchantTransfer'] });
    } catch (e) { console.error('JSSDK签名请求失败:', e); }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user_info');
    const lt = localStorage.getItem('login_type');
    if (stored && lt) {
      try {
        const u = JSON.parse(stored);
        if (u.openid) { setUser(u); setLoginType(lt); if (lt === 'mobile') initWxJSSDK(); loadUserData(u.openid, lt); }
      } catch { localStorage.removeItem('user_info'); localStorage.removeItem('login_type'); }
    }
  }, []);

  useEffect(() => {
    if (loginMode !== 'qrcode' || user) return;
    if (isWxLoginInitialized.current) return;
    const existingScript = document.querySelector('script[src*="wxLogin.js"]');
    if (existingScript && wxScriptRef.current) { initWxLogin(); return; }
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
    script.async = true;
    script.onload = () => { wxScriptRef.current = script; setTimeout(initWxLogin, 100); };
    script.onerror = () => alert('微信登录组件加载失败，请刷新页面重试');
    document.body.appendChild(script);
    return () => { const c = document.getElementById('wx_login_container'); if (c) c.innerHTML = ''; };
  }, [loginMode, user]);

  const initWxLogin = () => {
    if (isWxLoginInitialized.current) return;
    if (typeof window.WxLogin === 'undefined') { setTimeout(initWxLogin, 300); return; }
    const container = document.getElementById('wx_login_container');
    if (!container) return;
    try {
      isWxLoginInitialized.current = true;
      new window.WxLogin({ self_redirect: false, id: "wx_login_container", appid: WX_CONFIG.appId, scope: WX_CONFIG.scope, redirect_uri: encodeURIComponent(WX_CONFIG.redirectUri), state: WX_CONFIG.state, style: "black", fast_login: 1, color_scheme: "auto", onReady: (r) => { if (r) setWxLoginReady(true); } });
    } catch (e) { console.error('初始化微信登录失败:', e); isWxLoginInitialized.current = false; }
  };

  const handleSwitchLoginMode = (mode) => {
    setLoginMode(mode);
    if (mode === 'qrcode') { setWxLoginReady(false); isWxLoginInitialized.current = false; }
  };

  const handleWxCodeToUserInfo = async (code, isMobile = false) => {
    setLoading(true);
    try {
      const response = await fetch('/wanxiang/api/wechat/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, login_type: isMobile ? 'mobile' : 'web' }),
      });
      const rawText = await response.text();
      let data;
      try { data = JSON.parse(rawText); } catch { alert('服务器返回格式错误'); return; }
      if (data.success && data.user) {
        if (data.token) localStorage.setItem('token', data.token);
        const lt = isMobile ? 'mobile' : 'web';
        const newUser = {
          nickname: data.user.nickname || '微信用户',
          avatar: data.user.headimgurl || data.user.avatar || 'https://via.placeholder.com/100',
          id: data.user.openid, openid: data.user.openid, unionid: data.user.unionid,
          refcode: data.user.refcode || data.user.ref_code,
        };
        setUser(newUser); setLoginType(lt);
        localStorage.setItem('user_info', JSON.stringify(newUser));
        localStorage.setItem('login_type', lt);
        if (isMobile) initWxJSSDK();
        loadUserData(newUser.openid, lt);
      } else { alert('微信登录失败：' + (data.msg || '未知错误')); }
    } catch (e) { console.error('获取用户信息失败:', e); alert('网络错误，请重试'); }
    finally { setLoading(false); window.history.replaceState({}, document.title, window.location.pathname); }
  };

  const copyLink = (item) => {
    const finalLink = `${baseLink}${item.url_path}?ref=${user.refcode}`;
    navigator.clipboard.writeText(finalLink).then(() => {
      setCopiedId(item.id); setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const input = document.createElement('input'); input.value = finalLink;
      document.body.appendChild(input); input.select(); document.execCommand('copy'); document.body.removeChild(input);
      setCopiedId(item.id); setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const copyWxServiceId = () => {
    const wxId = 'woodwithyrj';
    navigator.clipboard.writeText(wxId).then(() => {
      setCopiedId('wx_service_card'); setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const inp = document.createElement('input'); inp.value = wxId;
      document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
      setCopiedId('wx_service_card'); setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleWithdraw = async () => {
    if (!isWeChatBrowser()) { setFailMsg('请在微信浏览器中打开本网站进行提现'); setShowFailDialog(true); return; }
    const balanceYuan = dashboard.balance / 100;
    const targetAmount = withdrawType === 'all' ? balanceYuan : parseFloat(withdrawAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) { alert('请输入有效金额'); return; }
    if (targetAmount < WITHDRAW_LIMITS.minAmount) { alert(`最低提现金额为 ¥${WITHDRAW_LIMITS.minAmount}`); return; }
    if (targetAmount > balanceYuan) { alert('金额超过余额'); return; }
    if (!user?.openid) { alert('用户信息不完整，请重新登录'); return; }

    const times = Math.ceil(targetAmount / WITHDRAW_LIMITS.singleMax);
    if (withdrawTimes === 1 && times > 1) setWithdrawTimes(times);

    const stepToExecute = withdrawTimes > 1 ? currentWithdrawStep : 0;
    const isLastWithdraw = stepToExecute === times - 1;
    const currentAmount = isLastWithdraw ? targetAmount - (stepToExecute * WITHDRAW_LIMITS.singleMax) : WITHDRAW_LIMITS.singleMax;

    const resetW = () => { setCurrentWithdrawStep(0); setWithdrawTimes(1); };
    const closeW = () => { setShowWithdraw(false); setWithdrawAmount(''); resetW(); };
    const refreshAfterWithdraw = (withdrawnAmountYuan) => {
      if (withdrawnAmountYuan) {
        const deductFen = Math.round(withdrawnAmountYuan * 100);
        setDashboard(prev => ({ ...prev, balance: Math.max((prev.balance || 0) - deductFen, 0) }));
      }
      fetchDashboard(user.openid, loginType);
      pollDashboard(user.openid, loginType, 3, 2000);
      if (withdrawals.length > 0 || activeTab === 'withdrawals') fetchWithdrawals(user.openid, loginType, 1);
    };

    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/wanxiang/api/withdraw', {
        method: 'POST', headers,
        body: JSON.stringify({ amount: currentAmount, openid: user.openid, login_type: loginType, nickname: user.nickname }),
      });
      const rawText = await response.text();
      let data;
      try { data = JSON.parse(rawText); } catch { alert('服务器返回格式错误'); setLoading(false); return; }

      if (data.success && data.direct) {
        if (isLastWithdraw || times === 1) { alert('提现成功！已到账微信零钱'); refreshAfterWithdraw(targetAmount); closeW(); }
        else { alert(`第 ${currentWithdrawStep + 1} 笔提现成功！...`); setCurrentWithdrawStep(prev => prev + 1); refreshAfterWithdraw(currentAmount); }
      } else if (data.success && data.package_info) {
        window.wx.checkJsApi({
          jsApiList: ['requestMerchantTransfer'],
          success: (checkRes) => {
            if (checkRes.checkResult?.requestMerchantTransfer) {
              WeixinJSBridge.invoke('requestMerchantTransfer', { mchId: data.mch_id, appId: data.app_id, package: data.package_info }, (res) => {
                if (res.err_msg === 'requestMerchantTransfer:ok') {
                  if (isLastWithdraw || times === 1) { alert('收款成功！'); refreshAfterWithdraw(targetAmount); closeW(); }
                  else { alert(`第 ${currentWithdrawStep + 1} 笔收款成功！...`); setCurrentWithdrawStep(prev => prev + 1); refreshAfterWithdraw(currentAmount); }
                } else if (res.err_msg === 'requestMerchantTransfer:cancel') { alert('您已取消收款，可稍后重试'); resetW(); }
                else { setFailMsg(res.err_msg || '收款异常'); setShowFailDialog(true); resetW(); }
                setLoading(false);
              });
            } else { setFailMsg('您的微信版本过低，请更新至最新版本'); setShowFailDialog(true); setLoading(false); }
          },
          fail: () => { setFailMsg('微信接口检查失败'); setShowFailDialog(true); setLoading(false); }
        });
        return;
      } else { setFailMsg(data.msg || '未知错误'); setShowFailDialog(true); resetW(); }
    } catch (e) { console.error('提现失败:', e); setFailMsg('请求失败：' + e.message); setShowFailDialog(true); resetW(); }
    finally { setLoading(false); }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts.includes('T') ? ts : ts.replace(' ', 'T'));
      if (isNaN(d.getTime())) return ts;
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ts; }
  };

  // ===== 登录页面 =====
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-5xl">💎</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">推广赚佣金</h1>
            <p className="text-gray-500 mt-2 text-sm">分享链接，轻松赚取高额佣金</p>
          </div>
          {!isOnMobileDevice && (
            <div className="flex justify-center gap-4 mb-6">
              <button onClick={() => handleSwitchLoginMode('mobile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${loginMode === 'mobile' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Smartphone size={16} /> 手机登录
              </button>
              <button onClick={() => handleSwitchLoginMode('qrcode')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${loginMode === 'qrcode' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <QrCode size={16} /> 扫码登录
              </button>
            </div>
          )}
          {loginMode === 'mobile' ? (
            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition disabled:opacity-70">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <><svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M8.5 2C4.4 2 1 5.1 1 9c0 2.1 1.1 4 2.8 5.3.1.1.2.3.1.4l-.4 1.4c0 .1 0 .2.1.3.1.1.2.1.3.1h.2l1.8-1.1c.2-.1.4-.1.5 0 .7.2 1.4.3 2.1.3.3 0 .5 0 .8-.1-.2-.5-.3-1.1-.3-1.6 0-3.4 3.1-6.2 7-6.2.3 0 .5 0 .8.1C16.4 4.6 12.8 2 8.5 2zm-3 5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5.5 2.3c-3.4 0-6.2 2.4-6.2 5.4s2.8 5.4 6.2 5.4c.6 0 1.2-.1 1.8-.2.2 0 .3 0 .5.1l1.4.8h.1c.1 0 .2-.1.2-.2v-.1l-.3-1.1c0-.2 0-.3.1-.4 1.4-1 2.3-2.6 2.3-4.3.1-3-2.7-5.4-6.1-5.4zm-2.5 4.3c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8zm4.8 0c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8z" /></svg>微信一键登录</>
              )}
            </button>
          ) : (
            <div className="text-center" key={`wx-login-${loginMode}`}>
              <div className="bg-gray-50 rounded-2xl p-6 mb-4 relative">
                {!wxLoginReady && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50 rounded-2xl">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">正在加载微信登录...</p>
                    </div>
                  </div>
                )}
                <div id="wx_login_container" ref={wxLoginContainerRef} className="min-h-[280px]" />
              </div>
              <p className="text-gray-500 text-sm">请使用微信扫一扫登录</p>
              <p className="text-green-600 text-xs mt-2 font-medium">💡 已登录微信客户端可快速登录，无需扫码</p>
            </div>
          )}
          <p className="text-center text-gray-400 text-xs mt-6">登录即表示同意《用户协议》和《隐私政策》</p>
        </div>
        {showWxGuide && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
              <button onClick={() => setShowWxGuide(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"><X size={20} className="text-gray-400" /></button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-green-500"><path d="M8.5 2C4.4 2 1 5.1 1 9c0 2.1 1.1 4 2.8 5.3.1.1.2.3.1.4l-.4 1.4c0 .1 0 .2.1.3.1.1.2.1.3.1h.2l1.8-1.1c.2-.1.4-.1.5 0 .7.2 1.4.3 2.1.3.3 0 .5 0 .8-.1-.2-.5-.3-1.1-.3-1.6 0-3.4 3.1-6.2 7-6.2.3 0 .5 0 .8.1C16.4 4.6 12.8 2 8.5 2zm-3 5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5.5 2.3c-3.4 0-6.2 2.4-6.2 5.4s2.8 5.4 6.2 5.4c.6 0 1.2-.1 1.8-.2.2 0 .3 0 .5.1l1.4.8h.1c.1 0 .2-.1.2-.2v-.1l-.3-1.1c0-.2 0-.3.1-.4 1.4-1 2.3-2.6 2.3-4.3.1-3-2.7-5.4-6.1-5.4zm-2.5 4.3c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8zm4.8 0c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">请在微信中打开</h3>
                <p className="text-gray-500 text-sm mt-2">微信登录需要在微信内置浏览器中使用</p>
              </div>
              <div className="space-y-4 mb-6">
                {['点击下方按钮复制当前页面链接', <span key="s">打开<span className="font-bold text-green-600">微信</span>，在聊天窗口中粘贴链接并发送</span>, '点击链接即可在微信中打开并完成登录'].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-sm text-gray-600">{t}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                const url = window.location.href.split('?')[0];
                navigator.clipboard.writeText(url).then(() => alert('链接已复制，请打开微信粘贴到聊天中')).catch(() => {
                  const inp = document.createElement('input'); inp.value = url; document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp); alert('链接已复制，请打开微信粘贴到聊天中');
                });
              }} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition">
                <Copy size={18} /> 复制链接
              </button>
              <button onClick={() => setShowWxGuide(false)} className="w-full text-gray-400 text-sm mt-3 py-2">取消</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== 主页面 =====
  const balanceYuan = fenToYuan(dashboard.balance);

  // 去掉了"推广素材"Tab，只保留3个
  const tabs = [
    { key: 'products', label: '推广链接', icon: <Copy size={14} /> },
    { key: 'orders', label: '成交订单', icon: <FileText size={14} /> },
    { key: 'withdrawals', label: '提现记录', icon: <ArrowDownCircle size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 pb-24 md:pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full bg-white" />
              <div>
                <p className="font-semibold">{user.nickname}</p>
                <p className="text-green-100 text-xs">ID: {user.id?.substring(0, 16)}...</p>
              </div>
            </div>
            <button onClick={() => {
              setUser(null); setWxLoginReady(false); isWxLoginInitialized.current = false;
              localStorage.removeItem('token'); localStorage.removeItem('user_info'); localStorage.removeItem('login_type');
              setDashboard({ balance: 0, total_earnings: 0, order_count: 0, referral_count: 0 });
              setProducts([]); setOrders([]); setWithdrawals([]); setActiveTab('products');
            }} className="p-2 hover:bg-white/20 rounded-full transition"><LogOut size={20} /></button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-20">
        {/* 余额卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">可提现佣金 (元)</span>
            <button onClick={() => fetchDashboard(user.openid, loginType)}
              className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full hover:bg-green-200 transition">刷新数据</button>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-800">¥{balanceYuan}</span>
            <button onClick={() => setShowWithdraw(true)} disabled={dashboard.balance <= 0}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50">
              <Wallet size={18} /> 提现
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">¥{fenToYuan(dashboard.total_earnings)}</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1"><TrendingUp size={12} />累计收益</p>
            </div>
            <div className="text-center border-x">
              <p className="text-xl font-bold text-gray-800">{dashboard.order_count}</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1"><Gift size={12} />成交订单</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{dashboard.referral_count}</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1"><Users size={12} />推广人数</p>
            </div>
          </div>
        </div>

        {/* Tab 区域 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-3.5 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap min-w-0 px-1 ${activeTab === tab.key ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab.icon} {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-green-500 rounded-full" />}
              </button>
            ))}
          </div>

          {/* ====== 推广链接 Tab（含推广素材） ====== */}
          {activeTab === 'products' && (
            <>
              <div className="p-4 bg-gray-50">
                <p className="text-gray-400 text-xs">复制链接或展开推广素材 · 可自定义售价提高收益</p>
              </div>
              {dataLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">加载产品中...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">暂无产品</div>
              ) : (
                <div className="p-4 space-y-3">
                  {products.map(item => {
                    const promoIdx = getPromoIndex(item.id);
                    const isPromoExpanded = expandedPromo === item.id;
                    const promoCopyId = `promo_${item.id}`;

                    return (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                        {/* 产品信息行 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800">{item.name}</p>
                              <p className="text-gray-400 text-xs">{item.desc}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-gray-400">当前售价 ¥{fenToYuan(item.active_price)}</span>
                                <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">佣金 ¥{fenToYuan(item.commission)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <button onClick={() => {
                              if (editingPrice === item.id) { setEditingPrice(null); } else {
                                setEditingPrice(item.id);
                                setPriceInput(item.custom_price ? (item.custom_price / 100).toString() : (item.recommended_price / 100).toString());
                              }
                            }} className="p-2 rounded-full text-gray-400 hover:bg-white transition" title="自定义价格">
                              {editingPrice === item.id ? <ChevronUp size={16} /> : <Edit3 size={16} />}
                            </button>
                            <button onClick={() => copyLink(item)}
                              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition ${copiedId === item.id ? 'bg-green-500 text-white' : 'bg-white text-green-600 hover:bg-green-50'}`}>
                              {copiedId === item.id ? <><Check size={16} />已复制</> : <><Copy size={16} />复制</>}
                            </button>
                          </div>
                        </div>

                        {/* 自定义价格（展开） */}
                        {editingPrice === item.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="bg-white rounded-xl p-4">
                              <p className="text-xs text-gray-500 mb-3">
                                价格范围：¥{fenToYuan(item.base_price)}（保底价）~ ¥{fenToYuan(item.max_price)}（最高价），推荐价 ¥{fenToYuan(item.recommended_price)}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                                  <input type="number" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                                    placeholder={`${fenToYuan(item.base_price)} ~ ${fenToYuan(item.max_price)}`}
                                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                                    step="0.01" min={item.base_price / 100} max={item.max_price / 100} />
                                </div>
                                <button onClick={() => handleSetPrice(item.id)} disabled={priceLoading}
                                  className="bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50 whitespace-nowrap">
                                  {priceLoading ? '保存中...' : '确认定价'}
                                </button>
                              </div>
                              {priceInput && (
                                <p className="text-xs text-green-600 mt-2">
                                  预计佣金：¥{(Math.round(parseFloat(priceInput) * 100 * item.commission_rate / 100 / 100) * 100 / 100).toFixed(2)}（{item.commission_rate}%）
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 推广素材按钮 */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => setExpandedPromo(isPromoExpanded ? null : item.id)}
                            className="w-full flex items-center justify-between py-2 px-1 text-sm text-gray-500 hover:text-green-600 transition"
                          >
                            <div className="flex items-center gap-2">
                              <Megaphone size={14} />
                              <span>推广素材</span>
                              <span className="text-xs text-gray-300">文案 + 预览图</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform ${isPromoExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* 推广素材展开区域 */}
                          {isPromoExpanded && (
                            <div className="mt-2 space-y-4">
                              {/* 文案区域 */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-400">文案 #{promoIdx + 1}/{promotionTexts.length}</span>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-gray-100">
                                  <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed font-sans"
                                    style={{ fontFamily: 'inherit' }}>
                                    {getPromoTextForProduct(item)}
                                  </pre>
                                </div>

                                {/* 文案操作 */}
                                <div className="flex items-center gap-2 mt-2">
                                  <button onClick={() => copyPromoTextForProduct(item)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition ${copiedId === promoCopyId ? 'bg-green-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                                    {copiedId === promoCopyId ? <><Check size={14} />已复制</> : <><Copy size={14} />复制文案</>}
                                  </button>
                                  <button onClick={() => shufflePromoForProduct(item.id)}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                    <Shuffle size={14} /> 换一条
                                  </button>
                                </div>

                                {/* 翻页指示 */}
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                  <button onClick={() => setPromoIndexForProduct(item.id, (promoIdx - 1 + promotionTexts.length) % promotionTexts.length)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <ChevronLeft size={16} />
                                  </button>
                                  <div className="flex gap-1">
                                    {Array.from({ length: Math.min(promotionTexts.length, 10) }, (_, i) => {
                                      const total = promotionTexts.length;
                                      let idx;
                                      if (total <= 10) {
                                        idx = i;
                                      } else {
                                        const start = Math.max(0, Math.min(promoIdx - 4, total - 10));
                                        idx = start + i;
                                      }
                                      return (
                                        <button key={idx} onClick={() => setPromoIndexForProduct(item.id, idx)}
                                          className={`w-1.5 h-1.5 rounded-full transition ${idx === promoIdx ? 'bg-green-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />
                                      );
                                    })}
                                  </div>
                                  <button onClick={() => setPromoIndexForProduct(item.id, (promoIdx + 1) % promotionTexts.length)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* 预览图区域 */}
                              {PREVIEW_IMAGES.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Image size={14} className="text-gray-400" />
                                    <span className="text-xs text-gray-400">报告预览截图</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {PREVIEW_IMAGES.map(img => (
                                      <div key={img.id} className="relative group">
                                        <div className="bg-gray-100 rounded-lg overflow-hidden aspect-[3/4] cursor-pointer"
                                          onClick={() => setPreviewImg(img)}>
                                          <img src={img.url} alt={img.title}
                                            className="w-full h-full object-cover transition group-hover:scale-105"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                          />
                                          <div className="hidden items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-xs">
                                            加载失败
                                          </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-1.5">
                                          <div className="flex items-center justify-between">
                                            <span className="text-white text-[10px]">{img.title}</span>
                                            <div className="flex gap-1">
                                              <button onClick={(e) => { e.stopPropagation(); setPreviewImg(img); }}
                                                className="p-0.5 bg-white/30 rounded-full hover:bg-white/50 transition">
                                                <ZoomIn size={12} className="text-white" />
                                              </button>
                                              <button onClick={(e) => { e.stopPropagation(); saveImage(img); }}
                                                className="p-0.5 bg-white/30 rounded-full hover:bg-white/50 transition">
                                                {savingImg === img.id
                                                  ? <Check size={12} className="text-white" />
                                                  : <Download size={12} className="text-white" />}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ====== 成交订单 Tab ====== */}
          {activeTab === 'orders' && (
            <>
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <p className="text-gray-400 text-xs">共 {ordersTotal} 笔成交订单</p>
                <button onClick={() => fetchOrders(user.openid, loginType, 1)} disabled={ordersLoading}
                  className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full hover:bg-green-200 transition flex items-center gap-1 disabled:opacity-50">
                  <RefreshCw size={12} className={ordersLoading ? 'animate-spin' : ''} /> 刷新
                </button>
              </div>
              {ordersLoading && orders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">加载订单中...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">暂无成交订单</p>
                  <p className="text-gray-300 text-xs mt-1">分享推广链接，好友付款后即可获得佣金</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{order.product_icon || '📦'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{order.product_name}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{formatTime(order.paid_at) || '—'}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-bold text-green-600">+¥{fenToYuan(order.commission)}</p>
                          <p className="text-xs text-gray-400">付款 ¥{fenToYuan(order.paid_amount)}</p>
                        </div>
                        <ChevronDown size={16} className={`ml-2 text-gray-300 transition-transform flex-shrink-0 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                      </div>
                      {expandedOrder === order.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="bg-white rounded-xl p-3 space-y-2">
                            {[
                              ['订单编号', <span key="no" className="text-gray-600 font-mono text-[11px]">{order.order_no}</span>],
                              ['产品名称', order.product_name],
                              ['付款金额', <span key="a" className="text-gray-800 font-medium">¥{fenToYuan(order.paid_amount)}</span>],
                              ['佣金比例', `${order.commission_rate}%`],
                              ['佣金收入', <span key="c" className="text-green-600 font-bold">¥{fenToYuan(order.commission)}</span>],
                              ['付款时间', formatTime(order.paid_at) || '—'],
                              ...(order.buyer_nickname ? [['购买用户', order.buyer_nickname]] : []),
                            ].map(([label, val], i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-400">{label}</span>
                                <span className="text-gray-600">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {ordersHasMore && (
                    <div className="text-center pt-2">
                      <button onClick={() => fetchOrders(user.openid, loginType, ordersPage + 1, true)} disabled={ordersLoading}
                        className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                        {ordersLoading ? '加载中...' : '加载更多'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ====== 提现记录 Tab ====== */}
          {activeTab === 'withdrawals' && (
            <>
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <p className="text-gray-400 text-xs">共 {withdrawalsTotal} 笔成功提现</p>
                <button onClick={() => fetchWithdrawals(user.openid, loginType, 1)} disabled={withdrawalsLoading}
                  className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full hover:bg-green-200 transition flex items-center gap-1 disabled:opacity-50">
                  <RefreshCw size={12} className={withdrawalsLoading ? 'animate-spin' : ''} /> 刷新
                </button>
              </div>
              {withdrawalsLoading && withdrawals.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">加载提现记录中...</p>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="p-12 text-center">
                  <ArrowDownCircle size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">暂无提现记录</p>
                  <p className="text-gray-300 text-xs mt-1">佣金满足条件后即可提现到微信零钱</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {withdrawals.map(w => (
                    <div key={w.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Wallet size={18} className="text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">提现到微信零钱</p>
                          <p className="text-gray-400 text-xs mt-0.5">{formatTime(w.created_at) || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-bold text-orange-600">¥{fenToYuan(w.amount)}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">已到账</span>
                      </div>
                    </div>
                  ))}
                  {withdrawalsHasMore && (
                    <div className="text-center pt-2">
                      <button onClick={() => fetchWithdrawals(user.openid, loginType, withdrawalsPage + 1, true)} disabled={withdrawalsLoading}
                        className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                        {withdrawalsLoading ? '加载中...' : '加载更多'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部客服信息 */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-2">
          <span className="text-gray-300 text-xs">客服微信：</span>
          <span className="text-gray-400 text-xs font-mono">woodwithyrj</span>
          <button onClick={copyWxServiceId}
            className={`text-xs px-2 py-0.5 rounded transition ${copiedId === 'wx_service_card' ? 'text-green-600' : 'text-gray-300 hover:text-gray-500'}`}>
            {copiedId === 'wx_service_card' ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      {/* ====== 图片预览大图弹窗 ====== */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImg(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition z-10"
            onClick={() => setPreviewImg(null)}>
            <X size={24} className="text-white" />
          </button>

          {PREVIEW_IMAGES.length > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = PREVIEW_IMAGES.findIndex(i => i.id === previewImg.id);
                  setPreviewImg(PREVIEW_IMAGES[(idx - 1 + PREVIEW_IMAGES.length) % PREVIEW_IMAGES.length]);
                }}>
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = PREVIEW_IMAGES.findIndex(i => i.id === previewImg.id);
                  setPreviewImg(PREVIEW_IMAGES[(idx + 1) % PREVIEW_IMAGES.length]);
                }}>
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}

          <div className="max-w-lg w-full max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={previewImg.url} alt={previewImg.title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg" />
            <div className="flex items-center gap-3 mt-4">
              <span className="text-white text-sm">{previewImg.title}</span>
              <button onClick={() => saveImage(previewImg)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition">
                {savingImg === previewImg.id ? <><Check size={16} />已保存</> : <><Download size={16} />保存图片</>}
              </button>
            </div>
            {PREVIEW_IMAGES.length > 1 && (
              <div className="flex gap-2 mt-3">
                {PREVIEW_IMAGES.map(img => (
                  <button key={img.id} onClick={() => setPreviewImg(img)}
                    className={`w-2.5 h-2.5 rounded-full transition ${img.id === previewImg.id ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 提现弹窗 */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">申请提现</h3>
              <button onClick={() => { setShowWithdraw(false); setCurrentWithdrawStep(0); setWithdrawTimes(1); }} disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"><X size={20} /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-500 text-sm">可提现余额</p>
              <p className="text-3xl font-bold text-green-600">¥{balanceYuan}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <Wallet size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-700">
                  <p className="font-medium mb-1">💡 提现限额说明</p>
                  <p>单笔最高 ¥{WITHDRAW_LIMITS.singleMax}，单日最高 ¥{WITHDRAW_LIMITS.dailyMax}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${withdrawType === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" checked={withdrawType === 'all'} onChange={() => { setWithdrawType('all'); setCurrentWithdrawStep(0); setWithdrawTimes(1); }} disabled={loading} className="accent-green-500" />
                <div className="flex-1">
                  <span className="font-medium">全部提现 (¥{balanceYuan})</span>
                  {parseFloat(balanceYuan) > WITHDRAW_LIMITS.singleMax && (
                    <p className="text-xs text-orange-600 mt-1">需分 {Math.ceil(parseFloat(balanceYuan) / WITHDRAW_LIMITS.singleMax)} 次提现</p>
                  )}
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${withdrawType === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" checked={withdrawType === 'custom'} onChange={() => { setWithdrawType('custom'); setCurrentWithdrawStep(0); setWithdrawTimes(1); }} disabled={loading} className="accent-green-500" />
                <span className="font-medium">自定义金额</span>
              </label>
              {withdrawType === 'custom' && (
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">¥</span>
                    <input type="number" value={withdrawAmount} onChange={(e) => { setWithdrawAmount(e.target.value); setCurrentWithdrawStep(0); setWithdrawTimes(1); }}
                      placeholder={`最低 ¥${WITHDRAW_LIMITS.minAmount}`} disabled={loading}
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg" step="0.01" />
                  </div>
                  {withdrawAmount && parseFloat(withdrawAmount) > WITHDRAW_LIMITS.singleMax && (
                    <p className="text-xs text-orange-600 mt-2 ml-2">需分 {Math.ceil(parseFloat(withdrawAmount) / WITHDRAW_LIMITS.singleMax)} 次提现，每次 ¥{WITHDRAW_LIMITS.singleMax}</p>
                  )}
                </div>
              )}
            </div>
            {currentWithdrawStep > 0 && withdrawTimes > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">提现进度</span>
                  <span className="text-sm text-blue-600">{currentWithdrawStep} / {withdrawTimes}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentWithdrawStep / withdrawTimes) * 100}%` }} />
                </div>
                <p className="text-xs text-blue-700">已完成 {currentWithdrawStep} 笔，还需完成 {withdrawTimes - currentWithdrawStep} 笔</p>
              </div>
            )}
            <button onClick={handleWithdraw} disabled={loading || (withdrawType === 'custom' && !withdrawAmount)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-70">
              {loading ? (
                <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />处理中...</div>
              ) : currentWithdrawStep > 0 ? `继续提现 (第 ${currentWithdrawStep + 1}/${withdrawTimes} 笔)`
                : withdrawTimes > 1 && currentWithdrawStep === 0 ? `开始分批提现 (共 ${withdrawTimes} 笔)` : '确认提现'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-4">
              {withdrawTimes > 1 ? '微信单笔限额，需分批确认，每次确认后会自动到账' : '提现将即时到账微信零钱'}
            </p>
          </div>
        </div>
      )}

      {/* 提现失败弹窗 */}
      {showFailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">提现失败</h3>
            <p className="text-gray-500 text-sm mb-4">{failMsg}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-xs mb-2">请联系客服微信</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-gray-800">woodwithyrj</span>
                <button onClick={() => {
                  navigator.clipboard.writeText('woodwithyrj').then(() => {
                    setCopiedId('wx_service'); setTimeout(() => setCopiedId(null), 2000);
                  }).catch(() => {
                    const inp = document.createElement('input'); inp.value = 'woodwithyrj';
                    document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
                    setCopiedId('wx_service'); setTimeout(() => setCopiedId(null), 2000);
                  });
                }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${copiedId === 'wx_service' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                  {copiedId === 'wx_service' ? <><Check size={14} />已复制</> : <><Copy size={14} />复制</>}
                </button>
              </div>
            </div>
            <button onClick={() => setShowFailDialog(false)}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;