import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

import AIChatBox from "../chatboxAI/AIChatBox";

import CustomerSupportChat from "../customerchat/CustomerSupportChat";

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
               {/* Customer Support Chat */}
<CustomerSupportChat />
        </>

    );

}

export default Layout;