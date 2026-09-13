import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout() {

    return (

        <>

            <Header />

            <Navbar />

            <main
                style={{
                    minHeight: "80vh"
                }}
            >
                <Outlet />
            </main>

            <Footer />

           
           

        </>

    );

}

export default Layout;