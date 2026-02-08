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
  scope: 'snsapi_login',
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

  const wxLoginContainerRef = useRef(null);
  const wxScriptRef = useRef(null);
  const isWxLoginInitialized = useRef(false);

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
    const code = getUrlParam('code');
    const state = getUrlParam('state');

    if (code && state && state.includes('wx_login_state_')) {
      console.log('检测到微信授权回调，code:', code);
      handleWxCodeToUserInfo(code);
    }
  }, []);

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
        state: WX_CONFIG.state,
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

  // 手机端：跳转到微信授权页面
  const handleLogin = () => {
    setLoading(true);
    try {
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX_MP_APP_ID}&redirect_uri=...&scope=snsapi_userinfo&state=wx_mobile_state_xxx#wechat_redirect`;

      console.log('跳转到微信授权页面');
      window.location.href = authUrl;
    } catch (error) {
      console.error('微信登录跳转失败:', error);
      setLoading(false);
      alert('登录失败，请重试');
    }
  };

  // 用code换取用户信息
  const handleWxCodeToUserInfo = async (code) => {
    setLoading(true);
    console.log('开始用code换取用户信息');
    const state = getUrlParam('state');
    const loginType = state?.includes('mobile') ? 'mobile' : 'pc';
    try {
      const response = await fetch('/wanxiang/api/wechat/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, login_type: loginType }),
      });

      const data = await response.json();
      console.log('后端返回数据:', data);

      if (data.success && data.user) {
        setUser({
          nickname: data.user.nickname || '微信用户',
          avatar: data.user.headimgurl || data.user.avatar || 'https://via.placeholder.com/100',
          id: data.user.openid
        });
        console.log('登录成功');
      } else {
        alert('微信登录失败：' + (data.msg || '未知错误'));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
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

  // 处理提现
  const handleWithdraw = () => {
    const amount = withdrawType === 'all' ? balance : parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('请输入有效金额');
      return;
    }
    if (amount > balance) {
      alert('余额不足');
      return;
    }
    alert(`提现申请已提交！\n金额：¥${amount.toFixed(2)}\n预计1-3个工作日到账微信零钱`);
    setBalance(prev => prev - amount);
    setShowWithdraw(false);
    setWithdrawAmount('');
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

          <p className="text-center text-gray-400 text-xs mt-6">
            登录即表示同意《用户协议》和《隐私政策》
          </p>
        </div>
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
                className="p-2 hover:bg-gray-100 rounded-full"
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
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleWithdraw}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition"
            >
              确认提现
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