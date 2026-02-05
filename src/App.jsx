import { useState, useEffect } from 'react';
import { Copy, Check, LogOut, Wallet, QrCode, Smartphone, X, TrendingUp, Users, Gift } from 'lucide-react';

// 测算链接数据（后续可改成从后端API获取）
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

function App() {
  const [user, setUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState('all');
  const [balance, setBalance] = useState(1688.50);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // 检测屏幕宽度
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 模拟微信登录（实际需要接入微信SDK）
  const handleLogin = () => {
    setLoading(true);
    // TODO: 这里替换成真实的微信登录逻辑
    setTimeout(() => {
      setUser({
        nickname: '推广达人',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        id: 'wx_888666'
      });
      setLoading(false);
    }, 1500);
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
    // TODO: 这里调用后端API提交提现申请
    alert(`提现申请已提交！\n金额：¥${amount.toFixed(2)}\n预计1-3个工作日到账微信零钱`);
    setBalance(prev => prev - amount);
    setShowWithdraw(false);
    setWithdrawAmount('');
  };

  // ========== 登录页面 ==========
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

          {/* 登录方式切换 */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsMobile(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${
                isMobile ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Smartphone size={16} /> 手机登录
            </button>
            <button
              onClick={() => setIsMobile(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${
                !isMobile ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <QrCode size={16} /> 扫码登录
            </button>
          </div>

          {/* 手机端：一键登录 */}
          {isMobile ? (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* 微信图标 */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M8.5 2C4.4 2 1 5.1 1 9c0 2.1 1.1 4 2.8 5.3.1.1.2.3.1.4l-.4 1.4c0 .1 0 .2.1.3.1.1.2.1.3.1h.2l1.8-1.1c.2-.1.4-.1.5 0 .7.2 1.4.3 2.1.3.3 0 .5 0 .8-.1-.2-.5-.3-1.1-.3-1.6 0-3.4 3.1-6.2 7-6.2.3 0 .5 0 .8.1C16.4 4.6 12.8 2 8.5 2zm-3 5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm5.5 2.3c-3.4 0-6.2 2.4-6.2 5.4s2.8 5.4 6.2 5.4c.6 0 1.2-.1 1.8-.2.2 0 .3 0 .5.1l1.4.8h.1c.1 0 .2-.1.2-.2v-.1l-.3-1.1c0-.2 0-.3.1-.4 1.4-1 2.3-2.6 2.3-4.3.1-3-2.7-5.4-6.1-5.4zm-2.5 4.3c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8zm4.8 0c-.5 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.3.8-.8.8z"/>
                  </svg>
                  微信一键登录
                </>
              )}
            </button>
          ) : (
            /* PC端：扫码登录 */
            <div className="text-center">
              <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <QrCode size={80} className="text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">模拟二维码</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-sm">请使用微信扫一扫登录</p>
              <button onClick={handleLogin} className="mt-4 text-green-500 text-sm underline">
                模拟扫码成功
              </button>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-6">
            登录即表示同意《用户协议》和《隐私政策》
          </p>
        </div>
      </div>
    );
  }

  // ========== 主页面（登录后） ==========
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
              onClick={() => setUser(null)}
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
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition ${
                    copiedId === item.id
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
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 animate-slide-up">
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
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  withdrawType === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200'
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
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  withdrawType === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200'
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