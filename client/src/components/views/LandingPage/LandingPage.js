import React, { useEffect, useState } from "react";
import { FaCode } from "react-icons/fa";
import axios from "axios";
import { Icon, Col, Card, Row } from "antd";
import Meta from "antd/lib/card/Meta";
import ImageSlider from "../../utils/ImageSlider";
import CheckBox from "./Sections/CheckBox";
import RadioBox from "./Sections/RadioBox";
import SearchFeature from "./Sections/SearchFeature";

import { continents, price } from "./Sections/Datas";

function LandingPage() {
  const [Products, setProducts] = useState([]);
  // n번째를 건너뛴다.
  const [Skip, setSkip] = useState(0);
  // 한 화면에 8개만 보여준다.
  const [Limit, setLimit] = useState(8);
  const [PostSize, setPostSize] = useState(0);
  const [Next, setNext] = useState(false);
  const [Filters, setFilters] = useState({
    continents: [],
    price: [],
  });
  const [SearchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let body = {
      skip: Skip,
      limit: Limit,
    };

    getProducts(body);
  }, []);

  const getProducts = (body) => {
    axios.post("/api/product/products", body).then((res) => {
      if (res.data.success) {
        console.log(res.data);

        if (body.loadMore) {
          setProducts([...Products, ...res.data.productInfo]);
          console.log(res.data.next);
          setNext(res.data.next);
        } else {
          setProducts(res.data.productInfo);
        }
        setPostSize(res.data.postSize);
      } else {
        alert("상품들을 가져오는데 실패 했습니다.");
      }
    });
  };

  const loadMoreHandler = () => {
    let skip = Skip + Limit;

    let body = {
      skip: skip,
      limit: Limit,
      loadMore: true,
      filters: Filters,
    };
    getProducts(body);
    setSkip(skip);
  };

  const renderCards = Products.map((product, index) => {
    return (
      <Col lg={6} md={8} xs={24} key={index}>
        <Card
          cover={
            <a href={`/product/${product._id}`}>
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta title={product.title} description={`$${product.price}`} />
        </Card>
      </Col>
    );
  });

  // 체크한 결과를 가지고 목록을 다시 만들어줌
  const showFilteredResults = (filters) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: filters,
    };

    getProducts(body);
    setSkip(0);
  };

  const handlePrice = (value) => {
    const data = price;
    let array = [];

    console.log("value : ", value);
    for (let key in data) {
      if (data[key]._id === parseInt(value, 10)) {
        array = data[key].array;
        console.log("array : ", array);
      }
    }
    return array;
  };

  const handleFilters = (filters, category) => {
    console.log("filters, category :", filters, category);
    const newFilters = { ...Filters };

    newFilters[category] = filters;

    if (category === "price") {
      let priceValues = handlePrice(filters);
      console.log("priceValues : ", priceValues);
      newFilters["price"] = priceValues;
    }

    showFilteredResults(newFilters);
    setFilters(newFilters);
  };

  const updateSearchTerm = (newSearchTerm) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: Filters,
      searchTerm: newSearchTerm,
    };

    setSkip(0);
    setSearchTerm(newSearchTerm);
    getProducts(body);
  };

  console.log("부모 : ", SearchTerm);
  return (
    <div style={{ width: "75%", margin: "3rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2>
          Let's Travel Anywhere <Icon type="rocket" />
        </h2>
      </div>

      {/* Filter */}

      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          {/* CheckBox */}
          {/* CheckBox.js(자식)에서 부모로 보낸 업데이트된 정보가 */}
          {/* handleFilters={(filters <<)} 요기로 가게됨 */}
          <CheckBox
            list={continents}
            handleFilters={(filters) => handleFilters(filters, "continents")}
          />
        </Col>
        <Col lg={12} xs={24}>
          {/* RadioBox */}
        </Col>
      </Row>

      {/* RadioBox */}
      <RadioBox
        list={price}
        handleFilters={(filters) => handleFilters(filters, "price")}
      />
      {/* Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1rem auto",
        }}
      >
        <SearchFeature refreshFunction={updateSearchTerm} />
      </div>
      {/* Cards */}

      <Row gutter={[16, 16]}>{renderCards}</Row>

      <br />

      {PostSize >= Limit && !Next && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={loadMoreHandler}>더보기</button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
