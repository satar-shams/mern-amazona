import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return { ...state };
  }
};

function ProductScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    errorr: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        // dispatch({ type: 'FETCH_FAIL', payload: err.message });
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;
  const handleAddToCart = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };
  return loading ? (
    <div className="loader"></div>
  ) : error ? (
    // <div>{error}</div>
    <MessageBox message={error}></MessageBox>
  ) : (
    <div>
      <div className="back-to-result">
        <Link to="/">Back to result</Link>
      </div>
      <div className="details">
        {/* 3 columns 1 for image 1 for detail and 1 for action */}
        <div className="details-image">
          <img src={product.image} alt={product.name}></img>
        </div>
        <div className="details-info">
          <ul>
            <li>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h4>{product.name}</h4>
            </li>
            <li>
              <Rating rating={product.rating} numReviews={product.numReviews} />
            </li>
            <li>
              Price : <b>${product.price}</b>
            </li>
            <li>
              Description:
              <div>{product.description}</div>
            </li>
          </ul>
        </div>

        <div className="details-action">
          <ul>
            <li>Price: ${product.price}</li>
            <li>
              Status: {product.countInStock > 0 ? 'In Stock' : 'Unavailable.'}
            </li>
            <li>
              Qty:{' '}
              <select>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </li>
            <li>
              {product.countInStock > 0 && (
                <button onClick={handleAddToCart} className="button primary">
                  Add to Cart
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
