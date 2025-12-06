import java.util.HashMap;
import java.util.Map;

/**
 * VERSIÓN SIMPLIFICADA PARA NETBEANS
 * Detector de errores en precios usando HashMap
 */

public class DetectorPreciosSimple {
    
    // Contador de frecuencia con HashMap
    public static HashMap<Double, Integer> contarFrecuencias(double[] precios) {
        HashMap<Double, Integer> frecuencias = new HashMap<>();
        
        for (double precio : precios) {
            if (frecuencias.containsKey(precio)) {
                frecuencias.put(precio, frecuencias.get(precio) + 1);
            } else {
                frecuencias.put(precio, 1);
            }
        }
        
        return frecuencias;
    }
    
    // Obtener el precio más repetido
    public static Double obtenerPrecioMasRepetido(HashMap<Double, Integer> frecuencias) {
        Double precioMasRepetido = null;
        int frecuenciaMaxima = 0;
        
        for (Map.Entry<Double, Integer> entrada : frecuencias.entrySet()) {
            if (entrada.getValue() > frecuenciaMaxima) {
                frecuenciaMaxima = entrada.getValue();
                precioMasRepetido = entrada.getKey();
            }
        }
        
        return precioMasRepetido;
    }
    
    public static void main(String[] args) {
        double[] precios = {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5};
        
        System.out.println("Precios del supermercado:");
        System.out.print("[");
        for (int i = 0; i < precios.length; i++) {
            System.out.print("$" + precios[i]);
            if (i < precios.length - 1) System.out.print(", ");
        }
        System.out.println("]\n");
        
        // Contar frecuencias
        HashMap<Double, Integer> frecuencias = contarFrecuencias(precios);
        
        System.out.println("Frecuencia de precios:");
        for (Map.Entry<Double, Integer> entrada : frecuencias.entrySet()) {
            System.out.println("  $" + entrada.getKey() + " → " + entrada.getValue() + " veces");
        }
        
        // Mostrar el más repetido
        Double precioMasRepetido = obtenerPrecioMasRepetido(frecuencias);
        int frecuencia = frecuencias.get(precioMasRepetido);
        
        System.out.println("\nPrecio más repetido: $" + precioMasRepetido);
        System.out.println("Apariciones: " + frecuencia + " veces");
        System.out.println("REVISAR: Posible error o promoción");
    }
}
