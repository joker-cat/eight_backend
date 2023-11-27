// 請代入自己的網址路徑
const api_path = "joooker";
const token = "ijtQ77NlLqaCP2DIJnZj2U1cSX63";
const orderPageTable = document.querySelector('.orderPage-table');
let circleData = [];
let cart = 0;

// 時間戳轉換日期
function turn(timei) {
    const date = new Date(timei * 1000);
    // 取得年、月、日等資訊
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 拼接成 yyyy-mm-dd 格式
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

// 空的購物車
function empty() {
    orderPageTable.textContent = "購物車為空";
    orderPageTable.style.border = "none";
    orderPageTable.style.textAlign = "center";
}

// 取得訂單列表
function getOrderList() {
    return new Promise((res, rej) => {
        axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
            {
                headers: {
                    'Authorization': token
                }
            })
            .then(function (response) {
                circleData = response.data.orders;
                if (response.status !== 200 || response.data.orders.length === 0) {
                    empty();
                    return;
                }

                let str = `
                <thead>
                    <tr>
                        <th>訂單編號</th>
                        <th>聯絡人</th>
                        <th>聯絡地址</th>
                        <th>電子郵件</th>
                        <th>訂單品項</th>
                        <th>訂單日期</th>
                        <th>訂單狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>`;
                for (const i of response.data.orders) {
                    const products = i.products.map(e => e.title).join('<br/>');
                    const time = turn(i.createdAt);
                    str += `
                        <tr>
                        <td>${i.createdAt}</td>
                        <td>
                            <p>${i.user.name}</p>
                            <p>${i.user.tel}</p>
                        </td>
                        <td>${i.user.address}</td>
                        <td>${i.user.email}</td>
                        <td>
                            <p>${products}</p>
                        </td>
                        <td>${time}</td>
                        <td class="orderStatus">
                            <a onclick=editOrderList("${i.id}")>${i.paid === false ? "未處理" : "已處理"}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" value="刪除" onclick=deleteOrderItem("${i.id}")>
                        </td>
                    </tr>
                    `
                }
                orderPageTable.innerHTML = str;
                cart = response.data.orders.length;
                res(true);
            }).then(res => {
                circle(circleData);
            })
    })
}

// 修改訂單狀態
function editOrderList(orderId) {
    console.log(orderId);
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            "data": {
                "id": orderId,
                "paid": true
            }
        },
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            if (response.data.status) getOrderList();
        })
}

// 刪除全部訂單
function deleteAllOrder() {
    if (cart == 0) return;
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            getOrderList();
        })
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            if (response.data.orders == 0) empty();
            getOrderList();
        })
}

// 畫圖
function circle(getData) {
    let allCategory = [];
    getData.forEach(e => allCategory.push(...e.products.map(c => c.category)));
    let Classification = allCategory.reduce((acc, ipt) => {
        ipt in acc ? acc[ipt] += 1 : acc[ipt] = 1;
        return acc
    }, {});

    // console.log(Object.entries(Classification));
    c3c3(Object.entries(Classification));
    return true
}

// c3
function c3c3(arr) {
    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: [...arr],
            colors: {
                "床架": "#DACBFF",
                "收納": "#9D7FEA",
                "窗簾": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

async function init() {
    const get = await getOrderList();
    const drew = await circle(circleData);
    (get === true && drew === true) ? console.log('初始化成功') : console.log('初始化失敗');
}

init();