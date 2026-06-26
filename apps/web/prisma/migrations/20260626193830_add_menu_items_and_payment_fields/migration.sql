-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_bank" TEXT,
ADD COLUMN     "payment_card" TEXT,
ADD COLUMN     "payment_clabe" TEXT,
ADD COLUMN     "payment_holder" TEXT;

-- AlterTable
ALTER TABLE "participant_items" ADD COLUMN     "menu_item_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "default_payment_bank" TEXT,
ADD COLUMN     "default_payment_card" TEXT,
ADD COLUMN     "default_payment_clabe" TEXT,
ADD COLUMN     "default_payment_holder" TEXT;

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participant_items" ADD CONSTRAINT "participant_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
