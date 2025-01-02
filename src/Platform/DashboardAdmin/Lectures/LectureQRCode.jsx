import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "../../Users/Context/Context";

function LectureQRCode() {
  const [lectures, setLectures] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const [titleLecture, setTitleLecture] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const { URLAPI} = useContext(DataContext);

  // Fetch lectures
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/lectures`)
      .then((res) => {
        console.log(res.data)
        setLectures(res.data)
      
      })
      .catch((error) => {
        toast.error("Failed to load lectures. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle QR Code generation
  const handleCreateQR = (e) => {
    e.preventDefault();
    const foundLecture = lectures.find(
      (lecture) => lecture.title === titleLecture.name
    );
    if (foundLecture) {
      setQrValue(foundLecture.qr_code);
      setTitleLecture({ name: "" });
      toast.success("QR Code generated successfully!");
    } else {
      toast.error("Lecture not found");
      setQrValue("");
    }
  };

  // Print functionality
  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      {loading ? (
        <h1 className="text-center text-primary">Loading lectures...</h1>
      ) : (
        <>
          {/* Form for creating QR code */}
          <form className="m-3 p-4 w-lg-100 border rounded shadow-sm bg-light" onSubmit={handleCreateQR}>
            <h2 className="text-center text-dark">Create New QR</h2>
            <div className="form-group mt-3">
              <input
                type="text"
                className="form-control"
                placeholder="Lecture Title"
                value={titleLecture.name}
                onChange={(e) =>
                  setTitleLecture({ ...titleLecture, name: e.target.value })
                }
                maxLength={100}
                required
              />
            </div>
            <div className="text-center mt-4">
              <button className="btn btn-primary mx-2 m-2" type="submit">
                Create QR
              </button>
              <button className="btn btn-secondary mx-2 m-2" onClick={handlePrint}>
                Print QR
              </button>
            </div>
          </form>
          <h1 className="m-2" >
            {qrValue}
          </h1>

          {/* QR Code display */}
          {/* {qrValue && (
            <div className="text-center mt-4">
              <h3 className="text-success">QR Code</h3>
              <div
                className="d-inline-block p-3 border rounded shadow-sm bg-white"
                style={{ maxWidth: "256px" }}
              >
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={qrValue}
                  viewBox={`0 0 256 256`}
                />
              </div>
            </div>
          )} */}
        </>
      )}
    </div>
  );
}

export default LectureQRCode;
