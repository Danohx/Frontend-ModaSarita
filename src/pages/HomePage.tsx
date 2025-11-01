import ProductCard from '../components/ProductCard'
import styles from '../styles/HomePage.module.css'
import blusaSeda from '../assets/blusa_seda.webp'
import chaquetaCuero from '../assets/chaqueta_cuero.jpg'
import vestidoVerano from '../assets/vestido_floral.webp'
import pantalonMezclilla from '../assets/pantalones_mezclilla.jpg'

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Blusa Elegante de Seda',
    description: 'Perfecta para ocasiones especiales.',
    price: 45.00,
    imageUrl: blusaSeda,
  },
  {
    id: '2',
    title: 'Vestido Floral de Verano',
    description: 'Fresco y cómodo para el día a día.',
    price: 60.00,
    imageUrl: vestidoVerano,
  },
  {
    id: '3',
    title: 'Pantalones de Mezclilla',
    description: 'Un clásico que no puede faltar.',
    price: 55.00,
    imageUrl: pantalonMezclilla,
  },
  {
    id: '4',
    title: 'Chaqueta de Cuero Sintético',
    description: 'Estilo rockero para tus outfits.',
    price: 80.00,
    imageUrl: chaquetaCuero,
  },
]

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <h1 className={styles.pageTitle}>Catálogo Principal</h1>
      <div className={styles.productGrid}>
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            description={product.description}
            price={product.price}
            imageUrl={product.imageUrl}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage