import { useState, useEffect, useRef } from 'react';
import { Copy, Check, LogOut, Wallet, QrCode, Smartphone, X, TrendingUp, Users, Gift } from 'lucide-react';

// 测算链接数据
const calcLinks = [
  { id: 1, name: '八字精批', desc: '详解一生运势', price: 99, commission: 30, icon: '🔒' },
  { id: 2, name: '姻缘测算', desc: '测你的正缘何时出现', price: 68, commission: 20, icon: '💕' },
  { id: 3, name: '财运分析', desc: '2024财运详批', price: 88, commission: 25, icon: '💰' },
  { id: 4, name: '事业运势', desc: '职场发展指南', price: 78, commission: 22, icon: '📈' },
  { id: 5, name: '健康运程', desc: '全年健康预警', price: 58, commission: 18, icon: '❤️' },
  { id: 6, name: '塔罗占卜', desc: '解答你的困惑', price: 48, commission: 15, icon: '🎴' },
  { id: 7, name: '紫微斗数', desc: '命盘详解', price: 128, commission: 40, icon: '⭐' },
  { id: 8, name: '合婚配对', desc: '测两人缘分深浅', price: 88, commission: 26, icon: '💑' },
  { id: 9, name: '流年运势', desc: '把握全年机遇', price: 66, commission: 20, icon: '🌟' },
  { id: 10, name: '姓名测算', desc: '名字影响命运', price: 38, commission: 12, icon: '📝' },
];

// 微信登录配置
const WX_CONFIG = {
  appId: 'wxd642d4eeae08b232',
  redirectUri: "https://stellarsmart.cn/commission_web/",
  scope: 'snsapi_base',
  state: 'wx_login_state_' + Math.random().toString(36).substr(2, 10)
};

// 检测是否为真正的移动设备（通过 UA，而非屏幕宽度）
const isRealMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

function App() {
  const [user, setUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState('all');
  const [balance, setBalance] = useState(1688.50);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('mobile'); // 'mobile' | 'qrcode'
  const [wxLoginReady, setWxLoginReady] = useState(false);
  const [isOnMobileDevice, setIsOnMobileDevice] = useState(true);
  const [loginType, setLoginType] = useState(null); // 'mobile' 或 'web' - 记录用户是通过哪种方式登录的

  const wxLoginContainerRef = useRef(null);
  const wxScriptRef = useRef(null);
  const isWxLoginInitialized = useRef(false);
  // 在 App 组件内新增 state
  const [showWxGuide, setShowWxGuide] = useState(false);

  // 判断是否在微信内置浏览器中
  const isWeChatBrowser = () => {
    return /MicroMessenger/i.test(navigator.userAgent);
  };

  // 修改后的 handleLogin
  const handleLogin = () => {
    const ua = navigator.userAgent;
    const isWx = /MicroMessenger/i.test(ua);
    setDebugInfo(`UA: ${ua}\n\n是否微信: ${isWx}\n\nloginMode: ${loginMode}\n\nisOnMobile: ${isOnMobileDevice}`);
    setLoading(true);
    try {
      if (isWeChatBrowser()) {
        const mobileState = 'wx_login_state_mobile_' + Math.random().toString(36).substr(2, 10);
        const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx50afdd19b43f590e&redirect_uri=${encodeURIComponent(WX_CONFIG.redirectUri)}&response_type=code&scope=snsapi_userinfo&state=${mobileState}#wechat_redirect`;
        console.log('实际跳转URL:', authUrl);
        // alert(authUrl); // 方便在手机上看
        window.location.href = authUrl;
      } else {
        setLoading(false);
        setShowWxGuide(true);
      }
    } catch (error) {
      console.error('微信登录跳转失败:', error);
      setLoading(false);
      alert('登录失败，请重试');
    }
  };


  // 检测设备类型（只在挂载时检测一次）
  useEffect(() => {
    const mobile = isRealMobileDevice();
    setIsOnMobileDevice(mobile);
    // 移动设备始终用手机登录模式，不给切换选项
    setLoginMode(mobile ? 'mobile' : 'qrcode');
  }, []);

  // 从URL中获取参数
  const getUrlParam = (name) => {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = window.location.search.substr(1).match(reg);
    return r ? decodeURIComponent(r[2]) : null;
  };

  // 处理微信授权回调
  useEffect(() => {
    // 调试：打印完整URL信息
    console.log('当前完整URL:', window.location.href);
    console.log('search部分:', window.location.search);
    console.log('hash部分:', window.location.hash);

    const code = getUrlParam('code');
    const state = getUrlParam('state');

    console.log('解析到的code:', code);
    console.log('解析到的state:', state);

    if (code && state && state.includes('wx_login_state_')) {
      console.log('检测到微信授权回调，code:', code);
      const isMobile = state.includes('mobile');
      handleWxCodeToUserInfo(code, isMobile);
    }
  }, []);


  // 在 App 组件里新增：初始化微信JSSDK
  const initWxJSSDK = async () => {
    try {
      const res = await fetch('/wanxiang/api/wechat/jsapi_signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.href.split('#')[0] })
      });
      const data = await res.json();
      if (!data.success) {
        console.error('获取JSSDK签名失败:', data.msg);
        return;
      }

      window.wx.config({
        debug: false,
        appId: 'wx50afdd19b43f590e',
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['requestMerchantTransfer'],
      });

      window.wx.ready(() => {
        console.log('微信JSSDK初始化成功');
      });
      window.wx.error((err) => {
        console.error('微信JSSDK初始化失败:', err);
      });
    } catch (e) {
      console.error('JSSDK签名请求失败:', e);
    }
  };

  // PC端：加载微信登录SDK并初始化（仅在扫码模式下）
  useEffect(() => {
    if (loginMode !== 'qrcode' || user) {
      return;
    }

    if (isWxLoginInitialized.current) {
      console.log('微信登录已初始化，跳过');
      return;
    }

    console.log('准备加载微信登录SDK');

    const existingScript = document.querySelector('script[src*="wxLogin.js"]');
    if (existingScript && wxScriptRef.current) {
      console.log('微信登录脚本已存在，直接初始化');
      initWxLogin();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
    script.async = true;

    script.onload = () => {
      console.log('微信登录JS加载成功');
      wxScriptRef.current = script;
      setTimeout(() => {
        initWxLogin();
      }, 100);
    };

    script.onerror = () => {
      console.error('微信登录JS加载失败');
      alert('微信登录组件加载失败，请刷新页面重试');
    };

    document.body.appendChild(script);

    return () => {
      console.log('组件卸载，清理微信登录容器');
      const container = document.getElementById('wx_login_container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [loginMode, user]);

  // 初始化微信登录
  const initWxLogin = () => {
    if (isWxLoginInitialized.current) {
      console.log('微信登录已初始化，跳过');
      return;
    }

    if (typeof window.WxLogin === 'undefined') {
      console.error('WxLogin未定义，延迟重试');
      setTimeout(initWxLogin, 300);
      return;
    }

    const container = document.getElementById('wx_login_container');
    if (!container) {
      console.error('找不到wx_login_container');
      return;
    }

    try {
      console.log('开始初始化微信登录');
      isWxLoginInitialized.current = true;

      new window.WxLogin({
        self_redirect: false,
        id: "wx_login_container",
        appid: WX_CONFIG.appId,
        scope: WX_CONFIG.scope,
        redirect_uri: encodeURIComponent(WX_CONFIG.redirectUri),
        state: WX_CONFIG.state, // PC端使用默认state
        style: "black",
        fast_login: 1,
        color_scheme: "auto",
        onReady: function (isReady) {
          console.log('微信登录二维码加载状态:', isReady);
          if (isReady) {
            setWxLoginReady(true);
          }
        }
      });

      console.log('微信登录初始化完成');
    } catch (error) {
      console.error('初始化微信登录失败:', error);
      isWxLoginInitialized.current = false;
    }
  };

  // 切换登录方式（仅PC端可用）
  const handleSwitchLoginMode = (mode) => {
    console.log('切换登录模式:', mode);
    setLoginMode(mode);
    if (mode === 'qrcode') {
      setWxLoginReady(false);
      isWxLoginInitialized.current = false;
    }
  };

  // 用code换取用户信息
  const handleWxCodeToUserInfo = async (code, isMobile = false) => {
    setLoading(true);
    console.log('开始用code换取用户信息，登录方式:', isMobile ? 'mobile' : 'web');

    try {
      const response = await fetch('/wanxiang/api/wechat/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          login_type: isMobile ? 'mobile' : 'web' // 明确告诉后端登录方式
        }),
      });

      // 先拿到原始文本，看看后端到底返回了什么
      const rawText = await response.text();
      console.log('响应状态码:', response.status);
      console.log('响应原始内容:', rawText);

      // 再尝试解析JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('JSON解析失败，后端返回的不是JSON:', rawText.substring(0, 500));
        alert('服务器返回格式错误，请检查后端接口');
        return;
      }

      console.log('后端返回数据:', data);

      if (data.success && data.user) {
        // 关键修复1：保存token到localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token已保存到localStorage');
        }

        setUser({
          nickname: data.user.nickname || '微信用户',
          avatar: data.user.headimgurl || data.user.avatar || 'https://via.placeholder.com/100',
          id: data.user.openid,
          openid: data.user.openid, // 保存openid
          unionid: data.user.unionid // 保存unionid（如果可用）
        });

        // 记录登录方式
        setLoginType(isMobile ? 'mobile' : 'web');
        if (isMobile) {
          initWxJSSDK();
        }
        console.log('登录成功，登录方式:', isMobile ? 'mobile' : 'web');
      } else {
        alert('微信登录失败：' + (data.msg || '未知错误'));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
      // 清除URL中的code参数，避免重复处理
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // 复制推广链接
  const copyLink = (id) => {
    const link = `https://yoursite.com/r/${user?.id}/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 处理提现 - 修复核心逻辑
  const handleWithdraw = async () => {
    const amount = withdrawType === 'all' ? balance : parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) { alert('请输入有效金额'); return; }
    if (amount > balance) { alert('金额超过余额'); return; }
    if (!user?.openid) { alert('用户信息不完整，请重新登录'); return; }

    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/wanxiang/api/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount,
          openid: user.openid,
          login_type: loginType,
          nickname: user.nickname
        }),
      });

      const rawText = await response.text();
      console.log('提现响应:', response.status, rawText);

      let data;
      try { data = JSON.parse(rawText); } catch {
        alert('服务器返回格式错误');
        setLoading(false);
        return;
      }

      if (data.success && data.direct) {
        // 免确认模式，直接成功
        alert('提现成功！已到账微信零钱');
        setBalance(prev => prev - amount);
        setShowWithdraw(false);
        setWithdrawAmount('');
      } else if (data.success && data.package_info) {
        // 需要用户确认收款 - 调用微信JSAPI
        console.log('拉起用户确认收款页面');

        // 先检查是否支持
        window.wx.checkJsApi({
          jsApiList: ['requestMerchantTransfer'],
          success: function (checkRes) {
            console.log('checkJsApi结果:', checkRes);
            if (checkRes.checkResult && checkRes.checkResult.requestMerchantTransfer) {
              // 调用 WeixinJSBridge 拉起确认收款
              WeixinJSBridge.invoke(
                'requestMerchantTransfer',
                {
                  mchId: data.mch_id,
                  appId: data.app_id,
                  package: data.package_info,
                },
                function (res) {
                  console.log('确认收款结果:', res);
                  if (res.err_msg === 'requestMerchantTransfer:ok') {
                    alert('收款成功！');
                    setBalance(prev => prev - amount);
                    setShowWithdraw(false);
                    setWithdrawAmount('');
                  } else if (res.err_msg === 'requestMerchantTransfer:cancel') {
                    alert('您已取消收款，可稍后重试');
                  } else {
                    alert('收款失败：' + res.err_msg);
                  }
                  setLoading(false);
                }
              );
            } else {
              alert('您的微信版本过低，请更新至最新版本');
              setLoading(false);
            }
          },
          fail: function () {
            alert('微信接口检查失败，请重试');
            setLoading(false);
          }
        });
        return; // 这里return，不要在finally里setLoading(false)
      } else {
        alert('提现失败：' + (data.msg || '未知错误'));
      }
    } catch (error) {
      console.error('提现失败:', error);
      alert('请求失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };
  // 登录页面
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-5xl">💎</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">推广赚佣金</h1>
            <p className="text-gray-500 mt-2 text-sm">分享链接，轻松赚取高额佣金</p>
          </div>

          {/* 登录方式切换 - 仅在PC端显示 */}
          {!isOnMobileDevice && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => handleSwitchLoginMode('mobile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${loginMode === 'mobile' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
              >
                <Smartphone size={16} /> 手机登录
              </button>
              <button
                onClick={() => handleSwitchLoginMode('qrcode')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${loginMode === 'qrcode' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
              >
                <QrCode size={16} /> 扫码登录
              </button>
            </div>
          )}

          {/* 手机端登录（移动设备始终走这里） */}
          {loginMode === 'mobile' ? (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M8.5 2C4.4 2 1 5.1 1 9c0 2.1 1.1 4 2.8 5.3.1.1.2.3.1.4l-.4 1.4c0 .1 0 .2.1.3.1.1.2.1.3.1h.2l1.8-1.1c.2-.1.4-.1.5 0 .7.2 1.4.3 2.1.3.3 0 .5 0 .8-.1-.2-.5-.3-1.1-.3-1.6 0-3.4 3.1-6.2 7-6.2.3 0 .5 0 .8.1C16.4 4.6 12.8 2 8.5 2zm-3 5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5.5 2.3c-3.4 0-6.2 2.4-6.2 5.4s2.8 5.4 6.2 5.4c.6 0 1.2-.1 1.8-.2.2 0 .3 0 .5.1l1.4.8h.1c.1 0 .2-.1.2-.2v-.1l-.3-1.1c0-.2 0-.3.1-.4 1.4-1 2.3-2.6 2.3-4.3.1-3-2.7-5.4-6.1-5.4zm-2.5 4.3c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8zm4.8 0c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8z" />
                  </svg>
                  微信一键登录
                </>
              )}
            </button>
          ) : (
            /* PC端扫码登录 */
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
                <div
                  id="wx_login_container"
                  ref={wxLoginContainerRef}
                  className="min-h-[280px]"
                />
              </div>
              <p className="text-gray-500 text-sm">请使用微信扫一扫登录</p>
              <p className="text-green-600 text-xs mt-2 font-medium">
                💡 已登录微信客户端可快速登录，无需扫码
              </p>
            </div>
          )}
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 break-all whitespace-pre-wrap">
              {debugInfo}
            </div>
          )}
          <p className="text-center text-gray-400 text-xs mt-6">
            登录即表示同意《用户协议》和《隐私政策》
          </p>
        </div>

        {/* 微信引导弹窗 */}
        {showWxGuide && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
              <button
                onClick={() => setShowWxGuide(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-green-500">
                    <path d="M8.5 2C4.4 2 1 5.1 1 9c0 2.1 1.1 4 2.8 5.3.1.1.2.3.1.4l-.4 1.4c0 .1 0 .2.1.3.1.1.2.1.3.1h.2l1.8-1.1c.2-.1.4-.1.5 0 .7.2 1.4.3 2.1.3.3 0 .5 0 .8-.1-.2-.5-.3-1.1-.3-1.6 0-3.4 3.1-6.2 7-6.2.3 0 .5 0 .8.1C16.4 4.6 12.8 2 8.5 2zm-3 5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5.5 2.3c-3.4 0-6.2 2.4-6.2 5.4s2.8 5.4 6.2 5.4c.6 0 1.2-.1 1.8-.2.2 0 .3 0 .5.1l1.4.8h.1c.1 0 .2-.1.2-.2v-.1l-.3-1.1c0-.2 0-.3.1-.4 1.4-1 2.3-2.6 2.3-4.3.1-3-2.7-5.4-6.1-5.4zm-2.5 4.3c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8zm4.8 0c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">请在微信中打开</h3>
                <p className="text-gray-500 text-sm mt-2">
                  微信登录需要在微信内置浏览器中使用，请按以下步骤操作
                </p>
              </div>

              {/* 步骤说明 */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p className="text-sm text-gray-600">点击下方按钮复制当前页面链接</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p className="text-sm text-gray-600">打开<span className="font-bold text-green-600">微信</span>，在任意聊天窗口中粘贴链接并发送</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p className="text-sm text-gray-600">点击链接即可在微信中打开并完成登录</p>
                </div>
              </div>

              {/* 复制链接按钮 */}
              <button
                onClick={() => {
                  const url = window.location.href.split('?')[0]; // 去掉多余参数
                  navigator.clipboard.writeText(url).then(() => {
                    alert('链接已复制，请打开微信粘贴到聊天中');
                  }).catch(() => {
                    // clipboard API 不可用时用 fallback
                    const input = document.createElement('input');
                    input.value = url;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    alert('链接已复制，请打开微信粘贴到聊天中');
                  });
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Copy size={18} /> 复制链接
              </button>

              <button
                onClick={() => setShowWxGuide(false)}
                className="w-full text-gray-400 text-sm mt-3 py-2"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  // 主页面（登录后）
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      {/* 顶部背景 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 pb-24 md:pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full bg-white" />
              <div>
                <p className="font-semibold">{user.nickname}</p>
                <p className="text-green-100 text-xs">ID: {user.id}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUser(null);
                setWxLoginReady(false);
                isWxLoginInitialized.current = false;
                // 关键修复5：退出时清除token
                localStorage.removeItem('token');
              }}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 佣金卡片 */}
      <div className="max-w-3xl mx-auto px-4 -mt-20">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">可提现佣金 (元)</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              实时更新
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-4xl font-bold text-gray-800">¥{balance.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Wallet size={18} /> 提现
            </button>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">¥3256.80</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
                <TrendingUp size={12} />累计收益
              </p>
            </div>
            <div className="text-center border-x">
              <p className="text-xl font-bold text-gray-800">47</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
                <Gift size={12} />成交订单
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">328</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
                <Users size={12} />推广人数
              </p>
            </div>
          </div>
        </div>

        {/* 推广链接列表 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800">📋 推广链接大全</h2>
            <p className="text-gray-400 text-xs mt-1">点击复制链接，分享给好友即可赚取佣金</p>
          </div>
          <div className="divide-y">
            {calcLinks.map(item => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">售价¥{item.price}</span>
                      <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">
                        佣金¥{item.commission}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyLink(item.id)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition ${copiedId === item.id
                    ? 'bg-green-500 text-white'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                  {copiedId === item.id ? (
                    <><Check size={16} />已复制</>
                  ) : (
                    <><Copy size={16} />复制</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 提现弹窗 */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">申请提现</h3>
              <button
                onClick={() => setShowWithdraw(false)}
                disabled={loading} // 关键修复6：加载中禁用关闭按钮
                className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-500 text-sm">可提现余额</p>
              <p className="text-3xl font-bold text-green-600">¥{balance.toFixed(2)}</p>
            </div>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${withdrawType === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
              >
                <input
                  type="radio"
                  checked={withdrawType === 'all'}
                  onChange={() => setWithdrawType('all')}
                  disabled={loading} // 关键修复7：加载中禁用单选框
                  className="accent-green-500"
                />
                <span className="font-medium">全部提现 (¥{balance.toFixed(2)})</span>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${withdrawType === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
              >
                <input
                  type="radio"
                  checked={withdrawType === 'custom'}
                  onChange={() => setWithdrawType('custom')}
                  disabled={loading} // 关键修复7：加载中禁用单选框
                  className="accent-green-500"
                />
                <span className="font-medium">自定义金额</span>
              </label>

              {withdrawType === 'custom' && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">¥</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="请输入提现金额"
                    disabled={loading} // 关键修复7：加载中禁用输入框
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading} // 关键修复8：加载中禁用提交按钮，防止重复点击
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  处理中...
                </div>
              ) : (
                '确认提现'
              )}
            </button>

            <p className="text-center text-gray-400 text-xs mt-4">
              提现将在1-3个工作日内到账微信零钱
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;