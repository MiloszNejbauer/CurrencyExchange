//package com.example.demo;
//
//import org.apache.catalina.connector.Connector;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
//import org.springframework.boot.web.server.WebServerFactoryCustomizer;
//import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
//
//@Configuration
//public class HttpToHttpsRedirectConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {
//
//    @Override
//    public void customize(ConfigurableServletWebServerFactory factory) {
//        if (factory instanceof TomcatServletWebServerFactory) {
//            ((TomcatServletWebServerFactory) factory)
//                    .addAdditionalTomcatConnectors(httpToHttpsRedirectConnector());
//        }
//    }
//
//    private Connector httpToHttpsRedirectConnector() {
//        Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
//        connector.setScheme("http");
//        connector.setPort(8080); // Port HTTP
//        connector.setSecure(false);
//        connector.setRedirectPort(8443); // Port HTTPS
//        return connector;
//    }
//}
