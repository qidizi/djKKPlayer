<?php
$passwordFile = __FILE__ . '.password.' . md5(__FILE__ . (empty($_GET['_p']) ? '' : $_GET['_p']));

// 生成密码串
//file_put_contents($passwordFile . '.tmp', $passwordFile);


/**
 * 以json格式输出内容
 * @param null $data
 * @param string $msg
 * @param string $code
 */
function response($data = null, $msg = '成功', $code = 'success')
{
    $data = [
        'msg' => $msg,
        'code' => $code,
        'data' => $data
    ];
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/**
 * 输出并终止php
 * @param string $msg
 * @param null $data
 */
function fail($msg = '异常', $data = null)
{
    response($data, $msg, 'fail');
    exit;
}

// 比如，对方编辑是gbk，那就把utf8转成gbk再提交过去，否则对将接受到的中文是乱码
function buildQueryEncode(&$value, $key, $charset = null)
{
    if (is_string($value)) $value = mb_convert_encoding($value, $charset, 'UTF-8');
}

function buildQuery($params, $charset, $pre = '')
{
    if (empty($params)) return '';

    if (!empty($charset)) {
        array_walk_recursive($params, 'buildQueryEncode', $charset);
    }

    return $pre . http_build_query($params);
}


// 允许任何域名通过ajax访问
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Methods: *', true);
header('Access-Control-Allow-Headers: *', true);

if (!file_exists($passwordFile)) {
    // TODO 设置授权码
    fail('您的授权密码有误');
}

unset($_GET['_p']);

if (empty($_GET['_u'])) {
    fail('用法：?_c=对方的编码_p=授权&_h[]=自定义请求头&_u=协议://跨域的域名/路径&...更多get参数、post会直接传递给对方');
}

$headers = [];
$charset = empty($_GET['_c']) ? null : $_GET['_c'];
unset($_GET['_c']);

if (!empty($_GET['_h'])) {
    $headers = $_GET['_h'];
    unset($_GET['_h']);
}

$headers = array_merge($headers, [
]);

// 使用当前浏览器信息
$url = $_GET['_u'];
unset($_GET['_u']);
$url .= buildQuery($_GET, $charset, '?');
$data = [
    'requestUri' => $url
];
$ch = curl_init($url);
$query = '';
curl_setopt($ch, CURLOPT_ACCEPT_ENCODING, 'gzip');
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
// 设定请求浏览器信息
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

if (!empty($_POST)) {
    // post
    $query = buildQuery($_POST, $charset);
    $data['requestMethod'] = 'POST';
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
} else {
    // get
    $data['requestMethod'] = 'GET';
    curl_setopt($ch, CURLOPT_HTTPGET, true);
}

if (is_array($headers) && !empty($headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

// 禁用后cURL将终止从服务端进行验证。使用CURLOPT_CAINFO选项设置证书使用CURLOPT_CAPATH选项设置证书目录 如果CURLOPT_SSL_VERIFYPEER(默认值为2)被启用，CURLOPT_SSL_VERIFYHOST需要被设置成TRUE否则设置为FALSE。
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
// 1 检查服务器SSL证书中是否存在一个公用名(common name)。译者注：公用名(Common Name)一般来讲就是填写你将要申请SSL证书的域名 (domain)或子域名(sub domain)。2 检查公用名是否存在，并且是否与提供的主机名匹配。
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
// 返回保存到变量中,不是直接输出到浏览器
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// 启用时会将头文件的信息作为数据流输出。
curl_setopt($ch, CURLOPT_HEADER, 0);
// 显示<= http code 400的信息
curl_setopt($ch, CURLOPT_FAILONERROR, TRUE);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 5); // 最大的重定向次数
// 有些网站可能是gbk的，json encode会返回null
$data['response'] = mb_convert_encoding(curl_exec($ch), 'UTF-8', 'GBK,UTF-8');
$data['requestError'] = curl_errno($ch);
$data['requestMsg'] = curl_error($ch);
$data['responseHeaders'] = curl_getinfo($ch);
curl_close($ch);
response($data);
