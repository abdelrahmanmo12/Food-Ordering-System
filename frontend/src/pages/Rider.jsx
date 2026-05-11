import { useApp } from '../context/AppContext'
import { useState, useEffect } from 'react'
import { getAvailableDeliveries, acceptDelivery, updateDeliveryStatus, getRiderDeliveries, getRiderStats } from '../api/rider'
import  Btn  from '../components/Button'
import  Badge  from '../components/Badge'
import { useNotification } from '../context/NotificationContext'
import { useNavigate } from "react-router-dom";

export default function Rider() {
  const { role, user } = useApp();
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('available');
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [riderStats, setRiderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [available, deliveries, stats] = await Promise.all([
        getAvailableDeliveries(),
        getRiderDeliveries(user.email),
        getRiderStats(user.email)
      ]);

      setAvailableDeliveries(available);
      setMyDeliveries(deliveries);
      setRiderStats(stats);
    } catch (error) {
      console.error('Failed to load rider data:', error);
      setError(error.message || 'Failed to load data.');
      showError(error.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      const updatedOrder = await acceptDelivery(user.email, orderId);
      showSuccess('Delivery accepted! Head to the restaurant to pick up the order.');

      // Update local state
      setAvailableDeliveries(availableDeliveries.filter(order => order.id !== orderId));
      setMyDeliveries([updatedOrder, ...myDeliveries]);

      // Refresh stats
      const stats = await getRiderStats(user.email);
      setRiderStats(stats);
    } catch (error) {
      showError(error.message || 'Failed to accept delivery.');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateDeliveryStatus(user.email, orderId, newStatus);
      showSuccess(`Order marked as ${newStatus.replace('_', ' ')}!`);

      // Update local state
      setMyDeliveries(myDeliveries.map(order =>
        order.id === orderId ? updatedOrder : order
      ));

      // Refresh stats if delivery completed
      if (newStatus === 'delivered') {
        const stats = await getRiderStats(user.email);
        setRiderStats(stats);
      }
    } catch (error) {
      showError(error.message || 'Failed to update status.');
    }
  };

  if (role !== "rider") return <AccessDenied />;

  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Loading delivery data...</div>;
  if (error) return (
    <div style={{
      maxWidth: 600,
      margin: "80px auto",
      padding: 24,
      textAlign: "center",
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)"
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: "var(--red)", marginBottom: 12 }}>Error Loading Data</h2>
      <p style={{ color: "var(--text2)", marginBottom: 20 }}>{error}</p>
      <Btn onClick={() => loadData()}>Retry</Btn>
    </div>
  );

  const tabs = [
    { id: 'available', label: 'Available Deliveries', icon: '📦' },
    { id: 'active', label: 'My Deliveries', icon: '🚴' },
    { id: 'history', label: 'Delivery History', icon: '📋' },
    { id: 'stats', label: 'My Stats', icon: '📊' }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 16 }}>
          🚴 Delivery Rider Dashboard
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 16 }}>
          Welcome back, {user?.name}! Ready to deliver some delicious food?
        </p>
      </div>

      {}
      {riderStats && (
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
          marginBottom: 32
        }}>
          <h3 style={{ marginBottom: 16 }}>Today's Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--amber)" }}>{riderStats.todayDeliveries}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>Today's Deliveries</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{riderStats.todayEarnings} EGP</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>Today's Earnings</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--blue)" }}>{riderStats.activeDeliveries}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>Active Deliveries</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#e67e22" }}>{riderStats.averageRating} ⭐</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>Average Rating</div>
            </div>
          </div>
        </div>
      )}

      {}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "var(--radius)",
              background: activeTab === tab.id ? "#e67e22" : "var(--bg2)",
              color: activeTab === tab.id ? "white" : "var(--text)",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {}
      {activeTab === 'available' && (
        <AvailableDeliveriesTab
          deliveries={availableDeliveries}
          onAcceptDelivery={handleAcceptDelivery}
        />
      )}

      {activeTab === 'active' && (
        <ActiveDeliveriesTab
          deliveries={myDeliveries.filter(d => d.status === 'on_the_way')}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeTab === 'history' && (
        <DeliveryHistoryTab
          deliveries={myDeliveries.filter(d => d.status === 'delivered')}
        />
      )}

      {activeTab === 'stats' && (
        <RiderStatsTab stats={riderStats} />
      )}
    </div>
  );
}

// Available Deliveries Tab
function AvailableDeliveriesTab({ deliveries, onAcceptDelivery }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 24 }}>
        Available Deliveries
      </h2>

      {deliveries.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
          <h3 style={{ color: "var(--text2)", marginBottom: 12 }}>No deliveries available</h3>
          <p style={{ color: "var(--text3)" }}>Check back later for new delivery opportunities!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {deliveries.map(order => (
            <div key={order.id} style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{order.id}</h3>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    {order.customerEmail} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    Restaurant: {order.restaurantName || 'Unknown Restaurant'}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)", marginBottom: 8 }}>
                    {order.total.toFixed(2)} EGP
                  </div>
                  <Badge color="var(--blue)">Ready for pickup</Badge>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8 }}>Order Items:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      background: "var(--bg3)",
                      borderRadius: "var(--radius)"
                    }}>
                      <span>{item.qty}x {item.name}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Btn onClick={() => onAcceptDelivery(order.id)}>
                  🚴 Accept Delivery
                </Btn>
                <Btn variant="ghost">
                  📍 View Location
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Active Deliveries Tab
function ActiveDeliveriesTab({ deliveries, onUpdateStatus }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 24 }}>
        My Active Deliveries
      </h2>

      {deliveries.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚴</div>
          <h3 style={{ color: "var(--text2)", marginBottom: 12 }}>No active deliveries</h3>
          <p style={{ color: "var(--text3)" }}>Accept a delivery to get started!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {deliveries.map(order => (
            <div key={order.id} style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{order.id}</h3>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    Customer: {order.customerDetails?.name || order.customerEmail}
                  </p>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    📞 {order.customerDetails?.phone || 'Not available'}
                  </p>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    📍 {order.customerDetails?.address || 'Address not available'}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)", marginBottom: 8 }}>
                    {order.total.toFixed(2)} EGP
                  </div>
                  <Badge color="#e67e22">Out for delivery</Badge>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8 }}>Delivery Details:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      background: "var(--bg3)",
                      borderRadius: "var(--radius)"
                    }}>
                      <span>{item.qty}x {item.name}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Btn onClick={() => onUpdateStatus(order.id, 'delivered')}>
                  ✅ Mark as Delivered (+25 EGP)
                </Btn>
                <Btn variant="ghost">
                  📍 Navigate to Customer
                </Btn>
                <Btn variant="ghost">
                  📞 Call Customer
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Delivery History Tab
function DeliveryHistoryTab({ deliveries }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 24 }}>
        Delivery History & Ratings
      </h2>

      {deliveries.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
          <h3 style={{ color: "var(--text2)", marginBottom: 12 }}>No completed deliveries yet</h3>
          <p style={{ color: "var(--text3)" }}>Complete your first delivery to see it here!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {deliveries.map(order => (
            <div key={order.id} style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{order.id}</h3>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    Delivered: {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                  <p style={{ color: "var(--text2)", margin: 4, fontSize: 14 }}>
                    Customer: {order.customerDetails?.name || order.customerEmail}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>
                    +25 EGP earned
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "#e67e22" }}>
                      {'⭐'.repeat(order.rating || 0)}
                    </span>
                    <span style={{ fontWeight: 600 }}>{order.rating || 0}/5</span>
                  </div>
                </div>
              </div>

              {order.review && (
                <div style={{
                  background: "var(--bg3)",
                  borderRadius: "var(--radius)",
                  padding: "12px",
                  marginBottom: 16
                }}>
                  <p style={{ margin: 0, fontStyle: "italic", color: "var(--text2)" }}>
                    "{order.review}"
                  </p>
                </div>
              )}

              <div>
                <h4 style={{ marginBottom: 8 }}>Order Summary:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      background: "var(--bg3)",
                      borderRadius: "var(--radius)"
                    }}>
                      <span>{item.qty}x {item.name}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} EGP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Rider Stats Tab
function RiderStatsTab({ stats }) {
  if (!stats) return <div>Loading stats...</div>;

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 24 }}>
        My Performance Stats
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--amber)" }}>{stats.totalDeliveries}</div>
          <div style={{ color: "var(--text2)" }}>Total Deliveries</div>
        </div>

        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{stats.completedDeliveries}</div>
          <div style={{ color: "var(--text2)" }}>Completed</div>
        </div>

        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#e67e22" }}>{stats.completionRate}%</div>
          <div style={{ color: "var(--text2)" }}>Completion Rate</div>
        </div>

        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#e67e22" }}>{stats.averageRating}</div>
          <div style={{ color: "var(--text2)" }}>Average Rating</div>
        </div>
      </div>

      <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px",
        marginTop: 20
      }}>
        <h3 style={{ marginBottom: 16 }}>Earnings Summary</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--text2)", marginBottom: 4 }}>Today's Earnings</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--green)", margin: 0 }}>
              {stats.todayEarnings} EGP
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "var(--text2)", marginBottom: 4 }}>Rate per delivery</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--amber)", margin: 0 }}>
              25 EGP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 500, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🚫</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>Access Denied</h2>
      <p style={{ color: "var(--text2)", marginBottom: 28 }}>You don't have permission to view this page.</p>
      <Btn onClick={() => navigate("/")}>Go Home</Btn>
    </div>
  );
}