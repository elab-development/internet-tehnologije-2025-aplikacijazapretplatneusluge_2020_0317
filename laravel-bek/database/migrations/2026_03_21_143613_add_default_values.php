<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('status')->default('aktivna')->change();
            $table->timestamp('datum_pocetka')->default(DB::raw('CURRENT_TIMESTAMP'))->change();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default('neuspesna')->change();
            $table->timestamp('datum')->default(DB::raw('CURRENT_TIMESTAMP'))->change();
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->string('pristup')->default('javno')->change();
            $table->timestamp('datum_objave')->default(DB::raw('CURRENT_TIMESTAMP'))->change();
        });

        Schema::table('post_images', function (Blueprint $table) {
            $table->integer('redosled')->default(0)->change();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Vraćanje na stanje bez default vrednosti (tj. NULL ili originalno)
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('status')->default(null)->change();
            $table->timestamp('datum_pocetka')->default(null)->change();
        });
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default(null)->change();
            $table->timestamp('datum')->default(null)->change();
        });
        Schema::table('posts', function (Blueprint $table) {
            $table->string('pristup')->default(null)->change();
            $table->timestamp('datum_objave')->default(null)->change();
        });
        Schema::table('post_images', function (Blueprint $table) {
            $table->integer('redosled')->default(0)->change(); // vrati na 0, ali u suštini ne vraćamo
        });
    }
};
