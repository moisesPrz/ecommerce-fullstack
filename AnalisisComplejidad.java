/**
 * ANÁLISIS DE COMPLEJIDAD
 * Este archivo contiene comentarios explicativos sobre la complejidad O(n)
 */

public class AnalisisComplejidad {
    
    /**
     * ANÁLISIS DE COMPLEJIDAD: O(n)
     * 
     * ¿Por qué es O(n)?
     * 
     * En el PEOR CASO (contarFrecuencia), el algoritmo debe recorrer
     * TODOS los elementos del array una sola vez.
     * 
     * Si el array tiene n elementos:
     * - El loop se ejecuta n veces
     * - Cada iteración: 1 comparación + 1 suma = 2 operaciones
     * - Total de operaciones: 2n ≈ O(n)
     * 
     * COMPLEJIDAD = O(n) porque el tiempo crece LINEALMENTE con n
     */
    
    public static int contarFrecuencia(int[] codigos, int codigoABuscar) {
        int contador = 0;
        // Este loop se ejecuta n veces (donde n = codigos.length)
        for (int i = 0; i < codigos.length; i++) {  // n iteraciones
            if (codigos[i] == codigoABuscar) {       // 1 comparación
                contador++;                          // 1 suma
            }
        }
        return contador;
    }
    
    /**
     * TABLA DE COMPARACIONES
     * 
     * Tamaño del Array    Comparaciones
     * ─────────────────────────────────
     * 10                  10
     * 100                 100
     * 1,000               1,000
     * 10,000              10,000
     * 1,000,000           1,000,000
     * 
     * Observación: Las comparaciones = n
     * Conclusión: Complejidad = O(n)
     */
    
    /**
     * ¿POR QUÉ NO BÚSQUEDA BINARIA?
     * 
     * Requisito de búsqueda binaria: ARRAY ORDENADO
     * 
     * Array Original (desordenado):
     * {550, 130, 220, 550, 999, 220, 501, 130, 700}
     * 
     * Array Ordenado (que necesitaría la binaria):
     * {130, 130, 220, 220, 501, 550, 550, 700, 999}
     * 
     * PROBLEMAS:
     * 1. Perderías el orden histórico de ventas
     * 2. Ordenar tomaría O(n log n) (más lento que lineal)
     * 3. La administradora necesita saber CUÁNDO se vendió
     * 
     * CONCLUSIÓN: La búsqueda LINEAL es la mejor opción
     */
    
    public static void main(String[] args) {
        System.out.println("=== ANÁLISIS DE COMPLEJIDAD ===");
        System.out.println();
        System.out.println("COMPLEJIDAD: O(n)");
        System.out.println();
        System.out.println("Razón: El algoritmo recorre hasta n elementos");
        System.out.println("       donde n = cantidad de códigos en el array");
        System.out.println();
        System.out.println("¿Por qué no binaria?");
        System.out.println("- El array NO está ordenado");
        System.out.println("- Ordenar sería más lento: O(n log n)");
        System.out.println("- Se perdería el orden histórico de ventas");
    }
}
