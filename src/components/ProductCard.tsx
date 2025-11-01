// src/components/ProductCard.tsx

import { Link } from 'react-router-dom'
import styles from '../styles/ProductCard.module.css'

// Definimos qué datos necesita nuestra tarjeta
interface ProductCardProps {
  id: string
  imageUrl: string
  title: string
  description: string
  price: number
}

const ProductCard = ({ id, imageUrl, title, description, price }: ProductCardProps) => {
  return (
    // Usamos 'Link' para que toda la tarjeta sea un enlace
    <Link to={`/producto/${id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>${price.toFixed(2)}</span>
          {/* El ícono del carrito de tu manual [cite: 37] */}
          <button className={styles.cartButton}>
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard