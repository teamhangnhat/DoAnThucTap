import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

import AIChatBox from "../chatboxAI/AIChatBox";

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

            {/* Chatbot AI */}
            <AIChatBox />

        </>

    );

}

export default Layout;