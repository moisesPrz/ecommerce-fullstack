/**
 * Sistema de búsqueda de códigos de productos en una tienda de ropa
 * Problema: Verificar si un código existe y contar cuántas veces aparece
 * Datos: {550, 130, 220, 550, 999, 220, 501, 130, 700}
 * Búsqueda: Código 220
 */

public class BusquedaProductos {
    
    /**
     * MÉTODO 1: Verificar si el código existe en la lista
     * @param codigos array con los códigos de productos vendidos
     * @param codigoABuscar el código que queremos encontrar
     * @return true si existe, false si no existe
     */
    public static boolean existeProducto(int[] codigos, int codigoABuscar) {
        // Recorre cada código en el array
        for (int i = 0; i < codigos.length; i++) {
            // Si encuentra el código, retorna true inmediatamente
            if (codigos[i] == codigoABuscar) {
                System.out.println("✓ Código " + codigoABuscar + " ENCONTRADO en posición: " + i);
                return true;
            }
        }
        // Si termina el loop sin encontrar, retorna false
        System.out.println("✗ Código " + codigoABuscar + " NO ENCONTRADO");
        return false;
    }
    
    /**
     * MÉTODO 2: Contar cuántas veces aparece el código (frecuencia)
     * @param codigos array con los códigos de productos vendidos
     * @param codigoABuscar el código que queremos contar
     * @return número de veces que aparece el código
     */
    public static int contarFrecuencia(int[] codigos, int codigoABuscar) {
        int contador = 0;
        
        // Recorre TODOS los elementos del array (sin parar al encontrar)
        for (int i = 0; i < codigos.length; i++) {
            if (codigos[i] == codigoABuscar) {
                contador++; // Incrementa cada vez que encuentra una coincidencia
            }
        }
        
        return contador;
    }
    
    /**
     * MÉTODO 3: Método combinado que hace ambas búsquedas
     * Retorna un objeto con el resultado
     */
    public static class ResultadoBusqueda {
        public boolean existe;
        public int frecuencia;
        public int posicionPrimera;
        
        public ResultadoBusqueda(boolean existe, int frecuencia, int posicionPrimera) {
            this.existe = existe;
            this.frecuencia = frecuencia;
            this.posicionPrimera = posicionPrimera;
        }
    }
    
    public static ResultadoBusqueda busquedaCompleta(int[] codigos, int codigoABuscar) {
        int contador = 0;
        int posicionPrimera = -1;
        
        for (int i = 0; i < codigos.length; i++) {
            if (codigos[i] == codigoABuscar) {
                contador++;
                // Guarda la posición de la primera aparición
                if (posicionPrimera == -1) {
                    posicionPrimera = i;
                }
            }
        }
        
        boolean existe = contador > 0;
        return new ResultadoBusqueda(existe, contador, posicionPrimera);
    }
    
    /**
     * MAIN: Pruebas del sistema
     */
    public static void main(String[] args) {
        // Array de códigos de productos vendidos (desordenado)
        int[] codigosProductos = {550, 130, 220, 550, 999, 220, 501, 130, 700};
        int codigoABuscar = 220;
        
        System.out.println("Códigos de productos vendidos: ");
        System.out.print("[");
        for (int i = 0; i < codigosProductos.length; i++) {
            System.out.print(codigosProductos[i]);
            if (i < codigosProductos.length - 1) System.out.print(", ");
        }
        System.out.println("]\n");
        
        // Verificar si existe el código
        existeProducto(codigosProductos, codigoABuscar);
        
        // Contar cuántas veces aparece
        int frecuencia = contarFrecuencia(codigosProductos, codigoABuscar);
        System.out.println("El código " + codigoABuscar + " aparece: " + frecuencia + " veces");
    }
}
