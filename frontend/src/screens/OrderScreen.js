import axios from 'axios';
import { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  //this is param from url
  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [{ loading, error, order }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });
  console.log(order);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [order, userInfo, orderId, navigate]);

  return loading ? (
    <div className="loader"></div>
  ) : error ? (
    <MessageBox message={error}></MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId} </title>
      </Helmet>
      <h1>Order: {orderId}</h1>
      <div className="placeorder">
        <div className="placeorder-info">
          <div>
            <h3>Shipping</h3>
            <div>
              <strong>Name:</strong> {order.shippingAddress.fullName} <br />
              <strong>Address:</strong> {order.shippingAddress.address},
              {order.shippingAddress.city},{order.shippingAddress.postalCode},
              {order.shippingAddress.country},
              <hr />{' '}
              {order.isDelivered ? (
                //first div is success and second danger
                <div className="completed">
                  Delivered at {order.deliveredAt}
                </div>
              ) : (
                <div className="notCompleted">Not Delivered</div>
              )}
            </div>
          </div>
          <div>
            <h3>Payment</h3>
            <strong>Method:</strong>
            {order.paymentMethod}
            <hr />
            {order.isPaid ? (
              <div className="completed"> Paid at {order.paidAt}</div>
            ) : (
              <div className="notCompleted">Not Paid</div>
            )}
          </div>

          <div>
            <ul className="cart-list-container">
              <li>
                <h3>items</h3>
                <div>Price</div>
              </li>
              {order.orderItems.map((item) => (
                <li key={item._id}>
                  <div className="cart-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-name">
                    <div>
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </div>
                    <div>Qty: {item.quantity}</div>
                  </div>
                  <div className="cart-price">$ {item.price}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="placeorder-action">
          <ul>
            <li>
              <h3>Order Summary</h3>
            </li>
            <li>
              <div>Items</div>
              <div>${order.itemsPrice.toFixed(2)}</div>
            </li>
            <hr />
            <li>
              <div>Shipping</div>
              <div>${order.shippingPrice.toFixed(2)}</div>
            </li>
            <hr />
            <li>
              <div>Tax</div>
              <div>${order.taxPrice.toFixed(2)}</div>
            </li>
            <hr />
            <li style={{ fontWeight: 'bold' }}>
              <div>Order Total</div>
              <div>${order.totalPrice.toFixed(2)}</div>
            </li>
            <hr />
          </ul>
        </div>
      </div>
    </div>
  );
}
