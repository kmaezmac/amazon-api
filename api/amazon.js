const AmazonPaapi = require('amazon-paapi');
require('dotenv').config(); // dotenvを追加

module.exports = async (req, res) => {
  // Amazon PA-APIの認証情報を環境変数から取得
  const { AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG, AMAZON_HOST, AMAZON_REGION } = process.env;

  // クエリからキーワード取得
  const { keyword } = req.query;

  if (!keyword) {
    res.status(400).json({ error: 'keyword is required' });
    return;
  }

  const commonParameters = {
    AccessKey: AMAZON_ACCESS_KEY,
    SecretKey: AMAZON_SECRET_KEY,
    PartnerTag: AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: AMAZON_HOST || 'www.amazon.co.jp'
  };

  const requestParameters = {
    Keywords: keyword,
    SearchIndex: 'All',
    ItemCount: 3
  };

  try {
    const data = await AmazonPaapi.SearchItems(commonParameters, requestParameters);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};