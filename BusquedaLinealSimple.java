/**
 * VERSIÓN SIMPLE PARA COPIAR Y PEGAR EN NETBEANS
 * Búsqueda Lineal - Tienda de Ropa
 */

public class BusquedaLinealSimple {
    
    // MÉTODO 1: Verificar si existe el código
    public static boolean existeProducto(int[] codigos, int codigoABuscar) {
        for (int i = 0; i < codigos.length; i++) {
            if (codigos[i] == codigoABuscar) {
                return true;
            }
        }
        return false;
    }
    
    // MÉTODO 2: Contar cuántas veces aparece
    public static int contarFrecuencia(int[] codigos, int codigoABuscar) {
        int contador = 0;
        for (int i = 0; i < codigos.length; i++) {
            if (codigos[i] == codigoABuscar) {
                contador++;
            }
        }
        return contador;
    }
    
    // MAIN
    public static void main(String[] args) {
        int[] codigosProductos = {550, 130, 220, 550, 999, 220, 501, 130, 700};
        int codigoABuscar = 220;
        
        System.out.println("=== BÚSQUEDA LINEAL ===");
        System.out.println("Array: [550, 130, 220, 550, 999, 220, 501, 130, 700]");
        System.out.println("Buscando: " + codigoABuscar);
        System.out.println();
        
        boolean existe = existeProducto(codigosProductos, codigoABuscar);
        System.out.println("¿Existe el código " + codigoABuscar + "? " + (existe ? "SÍ" : "NO"));
        
        int frecuencia = contarFrecuencia(codigosProductos, codigoABuscar);
        System.out.println("¿Cuántas veces aparece? " + frecuencia + " veces");
    }
}
