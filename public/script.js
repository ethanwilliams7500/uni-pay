const sections = document.querySelectorAll('main section')
const footerList = document.querySelectorAll('.footer-li')
const payList = document.querySelectorAll('.pay-list-li')
const payEffect = document.querySelector('.pay-effect')
const payMain = document.querySelectorAll('.pay-main > div')
const payTransfer = document.querySelector('.pay-transfer')
const payTransferActive = document.querySelector('.Transfer-region-active')
const balance = document.querySelector('.index-balance-amount')
const myName = document.querySelector('.my-name')
const myEmil = document.querySelector('.my-emil')
const myPayPassword = document.querySelector('.my-pay-password')
const myPayPasswordActive = document.querySelector('.my-pay-password-active')
const indexSave = document.querySelector('.index-save')
const indexSaveActive = document.querySelector('.index-save-active')
const indexSaveActiveForm = document.querySelector('.index-save-active-form')
const indexSaveCloseBtn = document.querySelector('.index-save-active .close-btn')
const indexWithdraw = document.querySelector('.index-withdraw')
const indexWithdrawActive = document.querySelector('.index-withdraw-active')
const indexWithdrawActiveForm = document.querySelector('.index-withdraw-active-form')
const indexWithdrawCloseBtn = document.querySelector('.index-withdraw-active .close-btn')
const closeBtn = document.querySelector('.close-btn')
const oldPayPassword = document.querySelector('.old-pay-password')
const newPayPassword = document.querySelector('.new-pay-password')
const myPayPasswordActiveForm = document.querySelector('.my-pay-password-active-form')
const region2 = document.querySelectorAll('.region2 > section')
const logOut = document.querySelector('.log-out')
const transferCloseBtn = document.querySelector('.Transfer-region-active .close-btn')
const payTransferForm = document.querySelector('.transfer-form')
const transferRequestUsername = document.querySelector('.transfer-username')
const transferRequestAmount = document.querySelector('.transfer-amount')
const indexBalance = document.querySelector('.index-balance')
const indexBalanceActive = document.querySelector('.index-balance-active')
const myTransactionRecords = document.querySelector('.my-transaction-records')
const transactionRecordsActive = document.querySelector('.transaction-records-active')
const toTransactionRecords = document.querySelector('.to-transaction-records')

// -------- localStorage 工具函数 --------
const setStockpile = (uname, item) => localStorage.setItem(uname, JSON.stringify(item))
const getStockpile = (uname, defaultValue = null) => {
    try {
        const data = JSON.parse(localStorage.getItem(uname))
        return data === null ? defaultValue : data
    } catch {
        return defaultValue
    }
}

function formatBalance(num) {
    if (num == null || isNaN(num)) return '0.00';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'; // 十亿级
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'; // 百万级
    if (num < 0.01) return num.toFixed(2); // 小于0.01保留两位小数
    return num.toFixed(2).toString();
}

function formatThousands(num) {
    const n = Number(num);
    if (!Number.isFinite(n)) return '';
    return new Intl.NumberFormat('en-US').format(n);
}

// -------- 用户工具函数 --------
function getCurrentUser() {
    const currentUser = getStockpile('UniPay-currentUser')
    const userData = getStockpile(`UniPay-${currentUser}-user`)
    return {currentUser, userData}
}

// 登录状态检查（避免死循环）
function loginCheck() {
    const currentUser = getStockpile('UniPay-currentUser');
    const isLoginPage = location.pathname.endsWith('login.html');

    if (!currentUser && !isLoginPage) {
        location.href = 'login.html';
    }
    if (currentUser && isLoginPage) {
        location.href = 'index.html';
    }
}

// 渲染首页信息
function render() {
    const {userData} = getCurrentUser();
    if (!userData) return;

    const {username, email, balance: userBalance} = userData
    balance.textContent = `US$ ${userBalance >= 1000000 ? formatBalance(userBalance) : formatThousands(userBalance.toFixed(2))}`
    myName.textContent = username
    myEmil.textContent = email

    const activeAmount = document.querySelector('.index-balance-active-amount')
    activeAmount.textContent = `US$ ${formatThousands(userBalance.toFixed(2))}`

    const transactionList = document.querySelector('.transaction-records-list')
    transactionList.innerHTML = ''; // 清空之前的记录

    transactionList.innerHTML = [...userData.transactions].reverse().map(transaction => {
        const {type, amount, date, to, from, game} = transaction;
        const flag = type === 'Deposit' || type === 'Collect' ? '+' : '-'
        const typeText = type === 'Deposit' ? '存入' :
            type === 'Withdraw' ? '取出' :
                type === 'Transfer' ? `转账➞ ${to}` :
                    type === 'Collect' ? `收款➞ ${from} ` :
                        type === 'game-recharge' ? `${game} 充值` : type

        return `
        <li class="transaction-records-item">
            <span class="transaction-records-type">${typeText}</span>
            <span class="transaction-records-amount" data-id="${flag}">${flag} ${formatThousands(amount.toFixed(2))} $</span>
            <span class="transaction-records-date">${date}</span>
        </li>
        `
    }).join('');

    const transactionRecordsAmount = document.querySelectorAll('.transaction-records-amount')
    transactionRecordsAmount.forEach(item => {
        const flag = item.dataset.id;
        if (flag === '+') {
            item.style.color = 'green';
        } else {
            item.style.color = 'red';
        }
    })
}

// -------- 页面初始化 --------
const init = () => {
    loginCheck()
    render()
}
init()

function togglePage() {
    region2.forEach(item => item.style.display = 'none')
}

// 阻止整个页面的触摸滚动，保持页面固定
document.body.addEventListener('touchmove', function (e) {
    e.preventDefault(); // 阻止页面拖动
}, {passive: false});

// 允许弹窗内容区域滚动
function enableModalScroll() {
    const modals = document.querySelectorAll('.index-save-active, .index-withdraw-active, .my-pay-password-active, .transaction-records-active, .Transfer-region-active, .index-balance-active');

    modals.forEach(modal => {
        if (modal.style.display === 'flex') {
            // 找到弹窗内的可滚动容器
            const scrollableContent = modal.querySelector('.index-save-active-box, .index-withdraw-active-box, .my-pay-password-active-box, .transaction-records-active-box, .Transfer-main, .index-balance-active-box');

            if (scrollableContent) {
                // 移除之前的事件监听器，避免重复绑定
                scrollableContent.removeEventListener('touchmove', handleModalScroll);
                // 允许弹窗内容滚动
                scrollableContent.addEventListener('touchmove', handleModalScroll, {passive: true});
            }
        }
    });
}

// 弹窗滚动事件处理函数
function handleModalScroll(e) {
    e.stopPropagation(); // 阻止事件冒泡到body
}

// 在弹窗显示时启用滚动
function showModal(modalElement) {
    modalElement.style.display = 'flex';
    // 延迟一下再启用滚动，确保DOM已更新
    setTimeout(enableModalScroll, 100);
}

// -------- 底部导航 --------
footerList.forEach((item, index) => {
    item.addEventListener('click', e => {
        if (e.target.tagName === 'LI') {
            footerList.forEach(item => item.style.color = 'black');
            footerList[index].style.color = '#2563eb'

            sections.forEach(item => item.classList.add('region-active'));
            sections[index].classList.remove('region-active');

            togglePage()
        }
    })
})

// -------- 支付方式切换 --------
payList.forEach((item, index) => {
    item.addEventListener('click', e => {
        if (e.target.tagName === 'LI') {
            togglePage()
            payList.forEach(item => item.style.color = 'black');
            payList[index].style.color = 'white'

            payEffect.style.transform =
                `translateX(${payList[index].offsetLeft - payEffect.offsetLeft + 1}px)`;

            payMain.forEach(item => item.style.display = 'none');
            payMain[index].style.display = 'flex'
        }
    })
})

// -------- 修改支付密码 --------
myPayPassword.addEventListener('click', () => {
    togglePage()
    showModal(myPayPasswordActive);
});

closeBtn.addEventListener('click', () => {
    myPayPasswordActive.style.display = 'none';
    myPayPasswordActiveForm.reset(); // 清空表单
});

myPayPasswordActiveForm.addEventListener('submit', e => {
    e.preventDefault();

    const oldPassword = oldPayPassword.value.trim();
    const newPassword = newPayPassword.value.trim();
    const {currentUser, userData} = getCurrentUser();

    if (!oldPassword || !newPassword) {
        alert('请填写完整信息！');
        return;
    }

    // ⚠️ 强制转换为字符串，避免 "123456" vs 123456 不相等的问题
    if (String(oldPassword) !== String(userData.payPassword)) {
        alert('旧支付密码错误！');
        return;
    }

    // 保存新密码为字符串
    userData.payPassword = String(newPassword);
    setStockpile(`UniPay-${currentUser}-user`, userData);

    alert('支付密码修改成功！');
    myPayPasswordActive.style.display = 'none';
    myPayPasswordActiveForm.reset();
})

logOut.addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
        location.href = 'login.html'
        setStockpile('UniPay-currentUser', null)
    }
})

// -------- 存入余额 --------
indexSave.addEventListener('click', () => {
    togglePage()
    showModal(indexSaveActive)
})

indexSaveCloseBtn.addEventListener('click', () => {
    indexSaveActive.style.display = 'none'
    indexSaveActiveForm && indexSaveActiveForm.reset()
})

indexSaveActiveForm.addEventListener('submit', e => {
    e.preventDefault()
    const saveAmount = parseFloat(indexSaveActiveForm.querySelector('.save-amount').value.trim());
    const savePayPassword = indexSaveActiveForm.querySelector('.save-pay-password').value.trim();
    const {currentUser, userData} = getCurrentUser();

    if (!saveAmount || !savePayPassword) {
        alert('请填写完整信息！');
        return;
    }
    if (saveAmount <= 0) {
        alert('存入金额必须大于0！');
        return;
    }
    if (String(savePayPassword) !== String(userData.payPassword)) {
        alert('支付密码错误！');
        return;
    }

    userData.transactions.push({
        type: 'Deposit',
        amount: saveAmount,
        date: new Date().toLocaleString()
    });
    userData.balance += saveAmount;
    setStockpile(`UniPay-${currentUser}-user`, userData);
    render()

    alert('存入成功！');
    indexSaveActive.style.display = 'none';
    indexSaveActiveForm.reset();
})

// -------- 取出余额 --------
indexWithdraw.addEventListener('click', () => {
    togglePage()
    showModal(indexWithdrawActive)
})

indexWithdrawCloseBtn.addEventListener('click', () => {
    indexWithdrawActive.style.display = 'none'
    indexWithdrawActiveForm && indexWithdrawActiveForm.reset()
})

indexWithdrawActiveForm.addEventListener('submit', e => {
    e.preventDefault()
    const withdrawAmount = parseFloat(indexWithdrawActiveForm.querySelector('.withdraw-amount').value.trim())
    const withdrawPayPassword = indexWithdrawActiveForm.querySelector('.withdraw-pay-password').value.trim()
    const {currentUser, userData} = getCurrentUser()

    if (!withdrawAmount || !withdrawPayPassword) {
        alert('请填写完整信息！')
        return
    }
    if (withdrawAmount <= 0) {
        alert('取出金额必须大于0！')
        return
    }
    if (String(withdrawPayPassword) !== String(userData.payPassword)) {
        alert('支付密码错误！')
        return
    }
    if (withdrawAmount > Number(userData.balance)) {
        alert('余额不足！')
        return
    }

    if (!Array.isArray(userData.transactions)) {
        userData.transactions = []
    }
    userData.transactions.push({
        type: 'Withdraw',
        amount: withdrawAmount,
        date: new Date().toLocaleString()
    })
    userData.balance -= withdrawAmount
    setStockpile(`UniPay-${currentUser}-user`, userData)
    render()

    alert('取出成功！')
    indexWithdrawActive.style.display = 'none'
    indexWithdrawActiveForm.reset()
})

payTransfer.addEventListener('click', () => {
    togglePage()
    showModal(payTransferActive)
})

transferCloseBtn.addEventListener('click', () => {
    payTransferActive.style.display = 'none'
    payTransferForm && payTransferForm.reset()
})

payTransferForm.addEventListener('submit', e => {
    e.preventDefault()
    const transferUsername = transferRequestUsername.value.trim()
    const transferAmount = parseFloat(transferRequestAmount.value.trim())
    const transferPayPassword = payTransferForm.querySelector('.transfer-pay-password').value.trim()
    const {currentUser, userData} = getCurrentUser()

    if (!transferUsername || !transferAmount || !transferPayPassword) {
        alert('请填写完整信息！')
        return
    }
    if (transferAmount <= 0) {
        alert('转账金额必须大于0！')
        return
    }
    if (transferUsername === userData.username) {
        alert('不能转账给自己！')
        return
    }
    if (!getStockpile(`UniPay-${transferUsername}-user`)) {
        alert('转账失败，用户不存在！')
        return
    }
    if (String(transferPayPassword) !== String(userData.payPassword)) {
        alert('支付密码错误！')
        return
    }
    if (transferAmount > 20000) {
        if (!confirm('单笔转账金额超过20000$，是否继续？')) {
            return
        }
    }
    if (transferAmount > Number(userData.balance)) {
        alert('余额不足！')
        return
    }


    alert('转账成功！')
    userData.balance -= transferAmount
    userData.transactions.push({
        type: 'Transfer',
        amount: transferAmount,
        to: transferUsername,
        date: new Date().toLocaleString()
    })
    setStockpile(`UniPay-${currentUser}-user`, userData)

    const transferDate = getStockpile(`UniPay-${transferUsername}-user`)

    transferDate.balance += transferAmount
    transferDate.transactions.push({
        type: 'Collect',
        amount: transferAmount,
        from: userData.username,
        date: new Date().toLocaleString()
    })
    setStockpile(`UniPay-${transferUsername}-user`, transferDate)

    render()

    payTransferActive.style.display = 'none'
    payTransferForm.reset()
})

indexBalance.addEventListener('click', () => {
    togglePage()
    showModal(indexBalanceActive)
})

indexBalanceActive.addEventListener('click', e => {
    if (e.target.classList.contains('close-btn')) {
        togglePage()
        indexBalanceActive.style.display = 'none'
    }
})

myTransactionRecords.addEventListener('click', () => {
    togglePage()
    showModal(transactionRecordsActive)
})

transactionRecordsActive.addEventListener('click', function (e) {
    if (e.target.classList.contains('close-btn')) {
        this.style.display = 'none';
    }
});

toTransactionRecords.addEventListener('click', () => {
    togglePage()
    showModal(transactionRecordsActive)
})