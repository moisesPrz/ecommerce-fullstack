import java.util.HashMap;
import java.util.Map;

/**
 * SISTEMA DE DETECCIÓN DE ERRORES EN PRECIOS
 * Problema: Un supermercado quiere detectar precios que se repiten muchas veces
 * para revisar si están mal digitados o en promoción
 * 
 * Datos: {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5}
 */

public class DetectorPreciosSupermercado {
    
    /**
     * TAREA 1: Implementar contador de frecuencia usando HashMap
     * @param precios array de precios del supermercado
     * @return HashMap con precios y sus frecuencias
     */
    public static HashMap<Double, Integer> contarFrecuenciasHashMap(double[] precios) {
        HashMap<Double, Integer> frecuencias = new HashMap<>();
        
        // Recorrer cada precio del array
        for (double precio : precios) {
            // Si el precio ya existe en el mapa, incrementa su contador
            if (frecuencias.containsKey(precio)) {
                frecuencias.put(precio, frecuencias.get(precio) + 1);
            } else {
                // Si no existe, lo agrega con frecuencia 1
                frecuencias.put(precio, 1);
            }
        }
        
        return frecuencias;
    }
    
    /**
     * TAREA 2: Identificar el precio que más se repite
     * @param frecuencias HashMap con precios y sus frecuencias
     * @return precio que más aparece
     */
    public static Double obtenerPrecioMasRepetido(HashMap<Double, Integer> frecuencias) {
        Double precioMasRepetido = null;
        int frecuenciaMaxima = 0;
        
        // Recorrer el HashMap para encontrar el precio con mayor frecuencia
        for (Map.Entry<Double, Integer> entrada : frecuencias.entrySet()) {
            if (entrada.getValue() > frecuenciaMaxima) {
                frecuenciaMaxima = entrada.getValue();
                precioMasRepetido = entrada.getKey();
            }
        }
        
        return precioMasRepetido;
    }
    
    /**
     * TAREA 3 y 4: Comparación con lista normal (Array)
     * Este método usa un array simple (ineficiente) para comparar complejidad
     */
    public static void contarFrecuenciasConArray(double[] precios) {
        System.out.println("\n=== MÉTODO CON ARRAY NORMAL (INEFICIENTE) ===");
        System.out.println("Buscando frecuencias usando comparaciones en array...\n");
        
        double[] preciosUnicos = new double[precios.length];
        int[] frecuencias = new int[precios.length];
        int contador = 0;
        
        // Para cada precio único
        for (int i = 0; i < precios.length; i++) {
            boolean yaExiste = false;
            
            // Buscar si ya lo registramos (búsqueda lineal)
            for (int j = 0; j < contador; j++) {
                if (preciosUnicos[j] == precios[i]) {
                    frecuencias[j]++;
                    yaExiste = true;
                    break;
                }
            }
            
            // Si no existe, lo agregamos
            if (!yaExiste) {
                preciosUnicos[contador] = precios[i];
                frecuencias[contador] = 1;
                contador++;
            }
        }
        
        System.out.println("Precios encontrados:");
        for (int i = 0; i < contador; i++) {
            System.out.println("  Precio: $" + preciosUnicos[i] + " → Aparece: " + frecuencias[i] + " veces");
        }
    }
    
    public static void main(String[] args) {
        double[] precios = {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5};
        
        System.out.println("╔═══════════════════════════════════════════════════════╗");
        System.out.println("║  DETECTOR DE ERRORES EN PRECIOS - SUPERMERCADO      ║");
        System.out.println("╚═══════════════════════════════════════════════════════╝\n");
        
        System.out.println("Precios registrados en el sistema:");
        System.out.print("[");
        for (int i = 0; i < precios.length; i++) {
            System.out.print("$" + precios[i]);
            if (i < precios.length - 1) System.out.print(", ");
        }
        System.out.println("]\n");
        
        // ========== TAREA 1: Contar frecuencias con HashMap ==========
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("TAREA 1: CONTADOR DE FRECUENCIA CON HASHMAP");
        System.out.println("═══════════════════════════════════════════════════════");
        
        HashMap<Double, Integer> frecuencias = contarFrecuenciasHashMap(precios);
        
        System.out.println("\nFrecuencia de cada precio:");
        for (Map.Entry<Double, Integer> entrada : frecuencias.entrySet()) {
            System.out.println("  Precio: $" + entrada.getKey() + " → Aparece: " + entrada.getValue() + " veces");
        }
        
        // ========== TAREA 2: Identificar precio más repetido ==========
        System.out.println("\n═══════════════════════════════════════════════════════");
        System.out.println("TAREA 2: PRECIO QUE MÁS SE REPITE");
        System.out.println("═══════════════════════════════════════════════════════");
        
        Double precioMasRepetido = obtenerPrecioMasRepetido(frecuencias);
        int frecuenciaMaxima = frecuencias.get(precioMasRepetido);
        
        System.out.println("\n*** ALERTA DE REVISIÓN NECESARIA ***");
        System.out.println("Precio más repetido: $" + precioMasRepetido);
        System.out.println("Apariciones: " + frecuenciaMaxima + " veces");
        System.out.println("Acción recomendada: Revisar si está mal digitado o en promoción\n");
        
        // ========== TAREA 3: Explicación de complejidad O(n) ==========
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("TAREA 3: COMPLEJIDAD DEL HASHMAP - O(n)");
        System.out.println("═══════════════════════════════════════════════════════\n");
        
        System.out.println("¿POR QUÉ HASHMAP ES O(n)?");
        System.out.println("───────────────────────────────────────────────────────");
        System.out.println("1. Recorremos el array UNA SOLA VEZ: O(n)");
        System.out.println("2. Para cada elemento:");
        System.out.println("   - Buscar en HashMap: O(1) en promedio");
        System.out.println("   - Insertar/actualizar: O(1) en promedio");
        System.out.println("\n3. Total: O(n) * O(1) = O(n)");
        System.out.println("\nConclusion: El tiempo crece LINEALMENTE con el tamaño del array\n");
        
        // ========== TAREA 4: Comparación con Array normal ==========
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("TAREA 4: COMPLEJIDAD CON ARRAY NORMAL");
        System.out.println("═══════════════════════════════════════════════════════");
        
        contarFrecuenciasConArray(precios);
        
        System.out.println("\n¿POR QUÉ ARRAY NORMAL ES O(n²)?");
        System.out.println("───────────────────────────────────────────────────────");
        System.out.println("1. Recorrer el array: O(n)");
        System.out.println("2. Para cada elemento, buscar si ya existe en array: O(n)");
        System.out.println("3. Total: O(n) * O(n) = O(n²)");
        System.out.println("\nConclusion: El tiempo crece CUADRÁTICAMENTE");
        System.out.println("Con 8 elementos: 64 comparaciones");
        System.out.println("Con 100 elementos: 10,000 comparaciones");
        System.out.println("Con 1,000 elementos: 1,000,000 comparaciones ❌ ¡LENTÍSIMO!\n");
        
        // ========== COMPARACIÓN VISUAL ==========
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("TABLA COMPARATIVA: HASHMAP vs ARRAY");
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("\nTamaño del Array  | HashMap (O(n)) | Array Normal (O(n²))");
        System.out.println("─────────────────────────────────────────────────────");
        System.out.println("10                | 10             | 100");
        System.out.println("100               | 100            | 10,000");
        System.out.println("1,000             | 1,000          | 1,000,000");
        System.out.println("10,000            | 10,000         | 100,000,000");
        System.out.println("\n*** HASHMAP ES MUCHO MÁS EFICIENTE ***\n");
    }
}
