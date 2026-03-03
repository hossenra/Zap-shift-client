import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const TrackParcel = () => {
  const { trackingId: trackingIdFromUrl } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure;

  const [trackingId, setTrackingId] = useState(trackingIdFromUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  const normalizedTrackingId = useMemo(() => trackingId.trim(), [trackingId]);

  const loadTracking = async (id) => {
    setError("");
    setLoading(true);
    setEvents([]);

    try {
      const res = await axiosSecure.get(`/tracking/${id}`);
      setEvents(res.data?.events || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tracking",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-load if tracking id is in URL
  useEffect(() => {
    if (trackingIdFromUrl) {
      setTrackingId(trackingIdFromUrl);
      loadTracking(trackingIdFromUrl.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingIdFromUrl]);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!normalizedTrackingId) {
      setError("Please enter a tracking ID");
      return;
    }
    // update URL so it’s shareable
    navigate(`/track/${normalizedTrackingId}`);
    await loadTracking(normalizedTrackingId);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-4">
          <h2 className="card-title">Track a Parcel</h2>

          <form onSubmit={onSearch} className="flex gap-2">
            <input
              className="input input-bordered w-full"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID (e.g., TRK-2026-000123)"
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {error && <p className="text-error">{error}</p>}

          {!loading && events.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold mb-3">Tracking Updates</h3>

              <ul className="timeline timeline-vertical">
                {events.map((ev) => (
                  <li key={ev._id}>
                    <div className="timeline-start text-xs opacity-70">
                      {new Date(ev.time).toLocaleString()}
                    </div>
                    <div className="timeline-middle">●</div>
                    <div className="timeline-end">
                      <div className="font-medium">{ev.status}</div>
                      {ev.message && (
                        <div className="text-sm opacity-80">{ev.message}</div>
                      )}
                      {ev.location && (
                        <div className="text-xs opacity-70">{ev.location}</div>
                      )}
                    </div>
                    <hr />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && !error && trackingIdFromUrl && events.length === 0 && (
            <p className="opacity-70">No tracking updates found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackParcel;
