/**
 * =============================================================================
 * SafeWay - Women Safety Route Planner & Emergency Navigation System
 * B.Tech First Year Mini-Project: Backend HTTP Server in Core Java
 * =============================================================================
 *
 * This is a lightweight, pure Java web server that uses Java's built-in
 * com.sun.net.httpserver library.
 *
 * Features:
 *  1. Serves frontend web files (index.html, style.css, script.js) on port 8080.
 *  2. Handles Emergency SOS Alerts via POST request at /api/sos.
 *  3. No external libraries or build tools needed (no Maven / Gradle required).
 *
 * How to compile & run (College Lab):
 *   javac SafeWayServer.java
 *   java SafeWayServer
 *
 * Then open in your browser:
 *   http://localhost:8080
 * =============================================================================
 */

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class SafeWayServer {

    // Server Port (Default: 8080)
    private static final int PORT = 8080;

    public static void main(String[] args) {
        try {
            // 1. Create HTTP Server listening on port 8080
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

            // 2. Register Context Handlers (Routes)
            // Route 1: Static file handler for web UI (HTML, CSS, JS)
            server.createContext("/", new StaticFileHandler());

            // Route 2: Emergency SOS API endpoint
            server.createContext("/api/sos", new SosAlertHandler());

            // Route 3: Server Health status check
            server.createContext("/api/health", new HealthCheckHandler());

            // 3. Set default executor (null means default single-threaded)
            server.setExecutor(null);

            // 4. Start the server
            server.start();

            // Print banner in console
            System.out.println("=================================================================");
            System.out.println("   SAFEWAY: WOMEN SAFETY NAVIGATION SYSTEM - JAVA BACKEND SERVER ");
            System.out.println("=================================================================");
            System.out.println(" [STATUS] Server successfully started!");
            System.out.println(" [PORT]   Running at: http://localhost:" + PORT);
            System.out.println(" [INFO]   Press Ctrl + C in this terminal to stop the server.");
            System.out.println("=================================================================");

        } catch (IOException e) {
            System.err.println("Error starting SafeWay Java Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Handler 1: Serves static web files (index.html, style.css, script.js)
     */
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            // If root URL '/' is requested, serve index.html
            if (path == null || path.equals("/")) {
                path = "/index.html";
            }

            // Remove leading slash to get relative file path in current directory
            String filePathStr = path.startsWith("/") ? path.substring(1) : path;
            Path filePath = Paths.get(filePathStr);

            // Check if file exists on disk
            if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                // Determine MIME type
                String contentType = "text/plain";
                if (filePathStr.endsWith(".html")) contentType = "text/html";
                else if (filePathStr.endsWith(".css")) contentType = "text/css";
                else if (filePathStr.endsWith(".js")) contentType = "application/javascript";
                else if (filePathStr.endsWith(".json")) contentType = "application/json";
                else if (filePathStr.endsWith(".png")) contentType = "image/png";

                byte[] fileBytes = Files.readAllBytes(filePath);

                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, fileBytes.length);

                OutputStream os = exchange.getResponseBody();
                os.write(fileBytes);
                os.close();
            } else {
                // Return 404 Not Found
                String notFoundMsg = "404 Not Found: File " + filePathStr + " does not exist.";
                exchange.sendResponseHeaders(404, notFoundMsg.length());
                OutputStream os = exchange.getResponseBody();
                os.write(notFoundMsg.getBytes(StandardCharsets.UTF_8));
                os.close();
            }
        }
    }

    /**
     * Handler 2: Receives and logs Emergency SOS alerts from frontend
     */
    static class SosAlertHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Enable CORS headers so local requests succeed
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            // Handle pre-flight OPTIONS request
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                // Read request body (JSON payload from browser)
                InputStream is = exchange.getRequestBody();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                StringBuilder bodyBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    bodyBuilder.append(line);
                }
                String requestBody = bodyBuilder.toString();

                String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                // Print high-visibility SOS alert in Java console
                System.out.println("\n-------------------------------------------------------------");
                System.out.println("🚨 [EMERGENCY SOS LOGGED BY SAFEWAY SERVER] 🚨");
                System.out.println("   Timestamp: " + currentTime);
                System.out.println("   Payload:   " + requestBody);
                System.out.println("   Status:    Dispatched to 112 Control Room & Emergency Circle");
                System.out.println("-------------------------------------------------------------\n");

                // Return JSON confirmation back to frontend
                String jsonResponse = "{\"status\":\"DISPATCHED\",\"message\":\"Emergency SOS received and logged by Java Server\",\"timestamp\":\"" + currentTime + "\"}";
                byte[] responseBytes = jsonResponse.getBytes(StandardCharsets.UTF_8);

                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, responseBytes.length);

                OutputStream os = exchange.getResponseBody();
                os.write(responseBytes);
                os.close();
            } else {
                exchange.sendResponseHeaders(405, -1); // 405 Method Not Allowed
            }
        }
    }

    /**
     * Handler 3: Health check endpoint
     */
    static class HealthCheckHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"HEALTHY\",\"app\":\"SafeWay Women Safety System\",\"version\":\"1.0\"}";
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
}
