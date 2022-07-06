import { useContext, useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
//import data from '../data';
import axios from 'axios';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return { ...state };
  }
};
function HomeScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    errorr: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === item._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  return (
    <div>
      <Helmet>
        <title>Amazona</title>
      </Helmet>
      <h1>Featured Products</h1>
      {loading ? (
        <>
          <div className="loader"></div>
        </>
      ) : error ? (
        <MessageBox message={error}></MessageBox>
      ) : (
        <ul className="products">
          {products.map((product) => (
            <li key={product.slug}>
              <div className="product">
                <Link to={`/product/${product.slug}`}>
                  <img
                    className="product-image"
                    src={product.image}
                    alt={product.name}
                  />
                </Link>
                <div className="product-name">
                  <Link to={`/product/${product.slug}`}>{product.name}</Link>
                </div>
                <div className="product-brand">{product.brand}</div>
                <div className="product-price">${product.price}</div>
                <Rating
                  rating={product.rating}
                  numReviews={product.numReviews}
                />
                {product.countInStock === 0 ? (
                  <button className="button secondary" disabled>
                    Out of stock
                  </button>
                ) : (
                  <button
                    onClick={() => addToCartHandler(product)}
                    className="button primary"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomeScreen;
